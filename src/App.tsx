import './App.css';
import Decimal from 'decimal.js';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from 'scrollreveal';
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import Article from './article';
import { getQueryVariable } from './utils';

const cacheKey = "data202212"
const defaultContent = "请下注";
let idCounter = 0;

const defaultTeams: Teams = {
    A: NewTeam(1, "甲胜", 0, 1),
    B: NewTeam(2, "乙胜", 0, 1),
    C: NewTeam(3, "平局", 0, 1)
}

//新建
function NewTeam(index: number, name: string, money: number, rate: number): Team {
    return {
        id: "team" + ++idCounter,
        index,
        name,
        money,
        rate,
    }
}

//兑奖
function getCashPrize(item: Team): Decimal {
    return new Decimal(item.money).mul(item.rate);
}

//收益
function getProfit(item: Team): Decimal {
    return getCashPrize(item).sub(item.money);
}

const getCacheData = (): CacheData | null => {
    const body = localStorage.getItem(cacheKey);
    if (!body) return null;
    try {
        const cacheData: CacheData = JSON.parse(body)
        return cacheData
    } catch (error) {
        localStorage.removeItem(cacheKey);
    }
    return null
}

const setCacheData = (teams: Teams, total: number) => {
    const cachedata: CacheData = { teams, total }
    localStorage.setItem(cacheKey, JSON.stringify(cachedata))
}

const noZeroArr = (teams: Teams): Team[] => {
    const arr: Team[] = []
    getTeamArr(teams).forEach((team) => {
        if (team.money !== 0) {
            arr.push(team)
        }
    })
    return arr
}

//获取所有的消耗
const getAllCharge = (teams: Teams): Decimal => {
    let all = new Decimal(0);
    Object.keys(teams).forEach((key) => {
        const team = teams[key];
        all = all.add(team.money)
    })
    return all
}

//获取总收益
const getAllProfit = (teams: Teams, team: Team): Decimal => {
    const arr = noZeroArr(teams)
    if (arr.length === 2) {
        const has = arr.some((_team) => {
            return _team.id === team.id
        })
        if (!has) {
            return new Decimal(0)
        }
    }
    let allCharge: Decimal = getAllCharge(teams)
    let cashPrize: Decimal = getCashPrize(team)
    //奖金 - 投入 = 收益
    return cashPrize.sub(allCharge)
}

//获取输入的值，并进行规范修改
const getInputValue = (el: HTMLInputElement): string => {
    const value = el.value.replaceAll("。", ".").replaceAll("、", ".").replaceAll("，", ".").trim()
    el.value = value
    return value
}

const copyDefaultTeams = (): Teams => {
    try {
        const obj: Teams = JSON.parse(JSON.stringify(defaultTeams))
        return obj
    } catch (error) {
        console.error("copyDefaultTeams has error:", error)
    }
    return defaultTeams;
}

const teams2Array = (teams: Teams): Team[] => {
    return Object.keys(teams).map(key => {
        return teams[key]
    })
}

const getTeamArr = (teams: Teams): Team[] => {
    const teamArr = teams2Array(teams)
    teamArr.sort((a, b) => {
        return new Decimal(a.rate).toNumber() - new Decimal(b.rate).toNumber()
    })
    return teamArr
}

const getTeamList = (teams: Teams): Team[] => {
    const teamList = teams2Array(teams)
    teamList.sort((a, b) => {
        return a.index - b.index
    })
    return teamList
}

const getUrlRateDate = (): number[] => {
    const rateStr = getQueryVariable('rate')
    if (rateStr === null) return []
    try {
        const arr: number[] = JSON.parse(rateStr);
        return arr
    } catch (error) {
        return []
    }
}

const mergeInitData = (cacheData: CacheData | null) => {
    const defaultData = copyDefaultTeams();
    const urlRateArr = getUrlRateDate();
    if (urlRateArr.length !== 0) {
        urlRateArr[0] && (defaultData.A.rate = urlRateArr[0])
        urlRateArr[1] && (defaultData.B.rate = urlRateArr[1])
        urlRateArr[2] && (defaultData.C.rate = urlRateArr[2])
        return { ...defaultData }
    }
    if (cacheData === null) return { ...defaultData }
    if (!cacheData.teams) return { ...defaultData }
    return { ...copyDefaultTeams(), ...cacheData.teams }
}

function App() {
    useEffect(() => {
        let sr = ScrollReveal({ reset: true });
        return () => {
            sr.destroy()
        }
    })

    const cacheData = getCacheData()
    const initTeamsData: Teams = mergeInitData(cacheData)

    const [teams, setTeams] = useState<Teams>(initTeamsData);
    const [totalMoney, setTotalMoney] = useState<number>(cacheData?.total || 100);
    const totalRef = useRef<HTMLInputElement>(null);
    // const assignBtnTip = useRef<any>(null);

    const tippyArr = useRef<Instance<Props>[]>([]);

    const assignMod = useRef<number>(0)
    const assignModSwitch = () => {
        const modNum = 2 //总共有模式数量
        assignMod.current += 1
        if (assignMod.current === modNum) {
            assignMod.current = 0
        }
    }

    let isFirstLoad = useRef<boolean>(true)
    useEffect(() => {
        if (!isFirstLoad.current) return
        isFirstLoad.current = false
        const moneyInputs = document.querySelectorAll("input[data-name=money]");
        tippyArr.current = tippy(moneyInputs, {
            // default
            placement: "right",
            arrow: true,
            content: defaultContent,
            animation: 'scale',
            hideOnClick: false,
        });
        // const assignBtnE = document.querySelector(".assign-btn");
        // assignBtnE && (assignBtnTip.current = tippy(assignBtnE, {
        //     // default
        //     placement: "bottom",
        //     arrow: true,
        //     content: "请先reset表单数据",
        //     animation: 'scale',
        //     hideOnClick: false,
        // }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onChange = (el: EventTarget & HTMLInputElement, team: Team) => {
        const value = getInputValue(el)
        if (value.length === 0) return
        const pattern = /^(-|\+)?\d+\.$/
        if (pattern.test(value)) {
            return
        }
        const typeName = el.dataset.name
        if (typeName === "rate") {
            //只允许输入3位小数点
            const s = new Decimal(value).toFixed(3, Decimal.ROUND_DOWN)
            let num = new Decimal(s).toNumber()
            if (num >= 100) {
                num = 100
            }
            el.value = new Decimal(num).toString()
            team.rate = num
        } else if (typeName === "money") {
            //只允许输入2位小数点
            const s = new Decimal(value).toFixed(2, Decimal.ROUND_DOWN)
            let num = new Decimal(s).toNumber()
            if (num >= totalMoney) {
                num = totalMoney
            }
            el.value = new Decimal(num).toString()
            team.money = num
            //更改了当前，则其它也要变
            const arr = noZeroArr(teams)
            if (arr.length === 2) {
                const otherTeam = arr.find((_team) => {
                    return _team.id !== team.id
                })
                if (otherTeam) {
                    const otherV = new Decimal(totalMoney).sub(num).toNumber()
                    otherTeam.money = otherV
                }
            }
        } else {
            return
        }
        setTeams({ ...teams })
    }

    //输入完成之后的核心事件
    const hideInput = (el: HTMLInputElement) => {
        el.style.display = "none";
        setTimeout(() => {
            setCacheData(teams, totalMoney)
        })
    }

    //显示输入框
    const showInput = (el: EventTarget & HTMLDivElement) => {
        const target = el.querySelector("input");
        if (!target) return
        onFocus(target)
        target.style.display = "inline-block";
        setTimeout(() => {
            target.focus()
        });
    }

    //enter事件
    const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const el = e.currentTarget  //注意，这里只能用currentTarget
            hideInput(el)
        }
    }

    const findTeam = (id: string | undefined): Team | undefined => {
        if (!id) return undefined;
        const team = getTeamList(teams).find((team) => {
            return team.id === id
        })
        return team
    }

    //规范数据格式
    const onFocus = (el: HTMLInputElement) => {
        const id = el.dataset.id;
        const name = el.dataset.name;
        const team = findTeam(id)
        switch (name) {
            case 'money':
                let moneyV = new Decimal(team?.money || 0).toFixed(2, Decimal.ROUND_DOWN)
                moneyV = new Decimal(moneyV).toNumber().toString()
                el.value = moneyV
                setTippyContent(el)
                break
            case 'rate':
                let rateV = new Decimal(team?.rate || 1).toFixed(3, Decimal.ROUND_DOWN)
                rateV = new Decimal(rateV).toNumber().toString()
                el.value = rateV
                setTippyContent(el)
                break
            case 'total':
                el.value = new Decimal(totalMoney.toFixed(2)).toNumber().toString()
                break
            default:
        }
    }

    const totalInputChange = (el: HTMLInputElement) => {
        const value = getInputValue(el)
        if (value.length === 0) return
        const pattern = /^(\+)?\d+\.$/
        if (pattern.test(value)) {
            return
        }
        //只允许输入2位小数点
        const s = new Decimal(value).toFixed(2, Decimal.ROUND_DOWN)
        let num = new Decimal(s).toNumber()
        if (num >= 100000) {
            num = 100000
        } else if (num <= 0) {
            num = 1
        }
        el.value = new Decimal(num).toString()
        setTotalMoney(num)
    }

    const renderRate = (team: Team) => {
        const rateVal = new Decimal(team.rate).toFixed(3, Decimal.ROUND_DOWN)
        return <td>
            <div onClick={(e) => { showInput(e.currentTarget) }} >
                {rateVal}
                <input type="number" maxLength={8} max={100} data-id={team.id} data-name="rate" data-value="1.000"
                    onKeyUp={(e) => { onKeyUp(e) }}
                    onChange={(e) => { onChange(e.target, team) }}
                    onFocus={(e) => { onFocus(e.target) }}
                    onBlur={(e) => { hideInput(e.target) }}
                />
            </div>
        </td>
    }

    const renderMoney = (team: Team) => {
        const moneyVal = new Decimal(team.money).toFixed(2, Decimal.ROUND_DOWN)
        return <td>
            <div onClick={(e) => { showInput(e.currentTarget) }} >
                {moneyVal}
                <input type="number" maxLength={8} max={100000} data-id={team.id} data-name="money" data-value="1.00"
                    onKeyUp={(e) => { onKeyUp(e) }}
                    onChange={(e) => { onChange(e.target, team) }}
                    onFocus={(e) => { onFocus(e.target) }}
                    onBlur={(e) => { hideInput(e.target) }}
                />
            </div>
        </td>
    }

    const renderTeams = () => {
        return getTeamList(teams).map((team, index) => {
            const toatlProfit = getAllProfit(teams, team)
            return <tr key={"team-" + index}>
                <td>{team.name}</td>
                {renderRate(team)}
                {renderMoney(team)}
                <td><div>{getCashPrize(team).toFixed(2, Decimal.ROUND_DOWN)}</div></td>
                <td><div>{getProfit(team).toFixed(2, Decimal.ROUND_DOWN)} </div></td>
                <td><div>{toatlProfit.toFixed(2, Decimal.ROUND_DOWN)}</div></td>
            </tr>
        })
    }

    const renderTotal = () => {
        const value = new Decimal(totalMoney || 0).toFixed(2, Decimal.ROUND_DOWN)
        return <tr className='ttotal'>
            <td>总金额</td>
            <td colSpan={5}><div onClick={(e) => { showInput(e.currentTarget) }}>
                {value}
                <input type="number" maxLength={10} max={100000} ref={totalRef} data-name="total"
                    onKeyUp={(e) => { onKeyUp(e) }}
                    onChange={(e) => { totalInputChange(e.target) }}
                    onFocus={(e) => { onFocus(e.target) }}
                    onBlur={(e) => { hideInput(e.target) }}
                />
            </div>
            </td>
        </tr>
    }

    //提示逻辑
    //赔率最大者，优先配置money

    //检查数据是否已经设置好，设置好才能开启tip
    const isMoneyTip = (el: HTMLInputElement): boolean => {
        //不管当前，如果其它两个都为0，则使用默认的提示
        let count = 0;
        // const moneyInputs = document.querySelectorAll("input[data-name=money]")
        getTeamList(teams).forEach((team) => {
            if (team.id === el.dataset.id) {
                return
            }
            if (new Decimal(team.money).isZero()) {
                count += 1
            }
        })
        return count < 2
    }

    const getMaxContent = (teamArr: Team[]) => {
        const minDec = getCashPrize(teamArr[1])
        if (minDec.isZero()) {
            return defaultContent
        }
        const min = minDec.div(teamArr[2].rate).toFixed(2, Decimal.ROUND_DOWN)
        return `当前值 ≥ ${min}`
    }

    const getMidContent = (teamArr: Team[]) => {
        const arr = noZeroArr(teams)
        if (arr.length === 2) {
            const min = new Decimal(totalMoney).div(arr[0].rate).toFixed(2, Decimal.ROUND_DOWN)
            return `${totalMoney} ≥ 当前值 ≥ ${min}`
        }
        const maxDec = getCashPrize(teamArr[2])
        const minDec = getCashPrize(teamArr[0])
        const max = maxDec.div(teamArr[1].rate).toFixed(2, Decimal.ROUND_DOWN)
        const min = minDec.div(teamArr[1].rate).toFixed(2, Decimal.ROUND_DOWN)
        if (maxDec.isZero() && minDec.isZero()) {
            return defaultContent;
        } else if (maxDec.isZero()) {
            return `当前值 ≥ ${min}`
        } else if (minDec.isZero()) {
            return `${max} ≥ 当前值`
        } else {
            return `${max} ≥ 当前值 ≥ ${min}`
        }
    }

    const getMinContent = (teamArr: Team[]) => {
        const arr = noZeroArr(teams)
        if (arr.length === 2) {
            const min = new Decimal(totalMoney).div(arr[1].rate).toFixed(2, Decimal.ROUND_DOWN)
            return `${totalMoney} ≥ 当前值 ≥ ${min}`
        }
        const maxDec = getCashPrize(teamArr[1])
        if (maxDec.isZero()) {
            return defaultContent
        }
        const max = maxDec.div(teamArr[0].rate).toFixed(2, Decimal.ROUND_DOWN)
        return `${max} ≥ 当前值`
    }


    //设置当前input的提示内容
    const setTippyContent = (el: HTMLInputElement) => {
        const teamArr = getTeamArr(teams) //必须重新初始化数据
        const ok = isMoneyTip(el)
        const id = el.dataset.id;
        if (!id) return
        teamArr.some((team, index) => {
            const eq = id && team.id === id
            if (eq) {  //找出当前team对应的HTMLInputElement
                let msg = ""
                switch (true) {
                    case new Decimal(team.rate).isZero():
                        msg = "请先设置赔率";
                        break;
                    case !ok:
                        msg = defaultContent;
                        break
                    case index === 0:
                        msg = getMinContent(teamArr);
                        break
                    case index === 1:
                        msg = getMidContent(teamArr);
                        break
                    case index === 2:
                        msg = getMaxContent(teamArr);
                        break
                    default:
                        msg = defaultContent;
                        break;
                }
                tippyArr.current.some((tip) => {
                    const eq = tip.reference.isEqualNode(el)
                    if (eq) {
                        if (msg === defaultContent) {
                            tip.hide()
                        } else {
                            tip.show()
                        }
                        tip.setContent(msg)
                    }
                    return eq
                })
            }
            return eq
        })
    }

    const resetData = () => {
        localStorage.removeItem(cacheKey);
        const cpTeams = copyDefaultTeams()
        if (cpTeams === defaultTeams) {
            window.location.reload()
            return
        }
        // const tip = assignBtnTip.current as Instance<Props>
        // tip.disable()
        setTotalMoney(100)
        setTeams({ ...cpTeams })
    }



    //核心分配算法，分配三个
    const assignMoney3 = () => {
        const a_b = new Decimal(teams.A.rate).div(teams.B.rate)
        const a_c = new Decimal(teams.A.rate).div(teams.C.rate)
        const b_a = new Decimal(teams.B.rate).div(teams.A.rate)
        const b_c = new Decimal(teams.B.rate).div(teams.C.rate)
        const c_a = new Decimal(teams.C.rate).div(teams.A.rate)
        const c_b = new Decimal(teams.C.rate).div(teams.B.rate)

        const av = new Decimal(totalMoney).div(new Decimal(1).add(a_b).add(a_c))
        const bv = new Decimal(totalMoney).div(new Decimal(b_a).add(1).add(b_c))
        const cv = new Decimal(totalMoney).div(new Decimal(c_a).add(c_b).add(1))

        if (av.isFinite()) {
            teams.A.money = av.toNumber()
        }
        if (bv.isFinite()) {
            teams.B.money = bv.toNumber()
        }
        if (cv.isFinite()) {
            teams.C.money = cv.toNumber()
        }

        setTeams({ ...teams })
    }

    const assignMoney2 = (samll: Team, large: Team) => {
        /**
         * a > b
         * M ≥ A ≥ M/a
         * M ≥ B ≥ M/b
         */
        const setf = (av: number, bv: number) => {
            large.money = av
            samll.money = bv
            setTeams({ ...teams })
        }

        const a = large.rate  //表示大的rate
        const b = samll.rate  //表示小的rate
        const half = new Decimal(totalMoney).div(2).toNumber() //一半的金额
        if (a < b || a < 1) {
            return setf(0, 0)
        }
        if (a === b) {
            return setf(half, totalMoney - half)
        }
        const lessB = new Decimal(totalMoney).div(b).toNumber() //一定要优先算出B
        const lessA = new Decimal(totalMoney).div(a).toNumber()
        //A不能小于lessB

        if (assignMod.current === 0) { //默认的，稳健型投资
            assignModSwitch()
            return setf(lessA, lessB)
        } else if (assignMod.current === 1) { //高收益高风险
            assignModSwitch()
            return setf(totalMoney - lessB, lessB)
        }
    }

    const assignMoney = () => {
        if (totalMoney < 1) return
        const arr: Team[] = noZeroArr(teams)
        // const tip = assignBtnTip.current as Instance<Props>
        //当2个都不为0时，执行2分配方案
        if (arr.length === 2) {
            // tip.disable()
            assignMoney2(arr[0], arr[1])
        } else if (arr.length === 0) { //当全部都为0时，执行3分配方案
            // tip.disable()
            assignMoney3()
        } else {
            // tip.enable()
            // tip.show()
        }
    }

    return (
        <div className="App background">
            <header className="App-header">
                彩票购买方案
            </header>
            <article className='App-body'>
                <section className='content'>
                    <div className='base-rules'>
                        <h3>核心规则</h3>
                        <ul>
                            <li>Aa &ge; Bb &ge; Cc</li>
                            <li>Cc &ge; Aa &ge; Bb</li>
                            <li>Bb &ge; Cc &ge; Aa</li>
                        </ul>
                        <h3>资金分配规则</h3>
                        <ul>
                            <li>A = M/(1 + a/b + a/c)</li>
                            <li>B = M/(b/a + 1 + b/c)</li>
                            <li>C = M/(c/a + c/b + 1)</li>
                        </ul>
                        <div className='line'></div>
                    </div>
                    <div className='table-box'>
                        <table className='App-body-table'>
                            <thead>
                                <tr className='tnav'>
                                    <th>竞猜</th>
                                    <th>赔率</th>
                                    <th>金额</th>
                                    <th>兑奖</th>
                                    <th>收益</th>
                                    <th>总收益</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTeams()}
                            </tbody>
                            <tfoot>
                                {renderTotal()}
                            </tfoot>
                        </table>
                    </div>
                    <div className='tools'>
                        <div className='tools-box'>
                            <div className='tools-grid'>
                                <div className='reset'>
                                    <button className='reset-btn' onClick={resetData}>
                                        reset
                                    </button>
                                </div>
                                <div className='assign'>
                                    <button className='assign-btn' onClick={assignMoney}>
                                        assign
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
                <section className='content'>
                    <Article teams={teams} />
                </section>


            </article>

            <footer className='footer'>
                <p>
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/licat233/lottery-calculate" className="githubBtn">
                        <svg xmlns="http://www.w3.org/2000/svg" className="githubLogo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                        View on GitHub
                    </a>
                </p>
                <p>
                    温馨提示：成功没有捷径 ，努力造就明天
                    <br />彩票只是娱乐，而非致富捷径
                </p>
            </footer>
        </div >
    );
}





export default App;
