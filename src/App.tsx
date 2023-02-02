import './App.css';
import Decimal from 'decimal.js';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from 'scrollreveal';
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import Article from './article';
import { getQueryVariable } from './utils';

const cacheKey = "licatData";
const currentCacheVersion = "2023.02.02";
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
        status: true,
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
        if(cacheData.version !== currentCacheVersion) {
            throw new Error("Cache data version mismatch");
        }
        return cacheData
    } catch (error) {
        localStorage.removeItem(cacheKey);
    }
    return null
}

const setCacheData = (teams: Teams, total: number) => {
    const cachedata: CacheData = { teams, total, version: currentCacheVersion }
    localStorage.setItem(cacheKey, JSON.stringify(cachedata))
}

const getValidTeams = (teams: Teams): Team[] => {
    return getTeamArr(teams).filter(team => team.status);
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
    const arr = getValidTeams(teams)
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

const teamsArray = (teams: Teams): Team[] => {
    return Object.keys(teams).map(key => {
        return teams[key]
    })
}

/**
 * @description: 获取从小到大排列的，不管status=false的team
 * @param {Teams} teams
 * @return {Team[]}
 */
const getTeamArr = (teams: Teams): Team[] => {
    const teamArr = teamsArray(teams).filter(team => team.status)
    teamArr.sort((a, b) => {
        return new Decimal(a.rate).toNumber() - new Decimal(b.rate).toNumber()// 从小到大排列
    })
    return teamArr
}


/**
 * @description: 获取根据index正序排列的teams
 * @param {Teams} teams
 * @return {*}
 */
const getTeamList = (teams: Teams): Team[] => {
    const teamList = teamsArray(teams)
    teamList.sort((a, b) => {
        return a.index - b.index
    })
    return teamList
}

const getUrlDate = (name: string): string[] => {
    let str = getQueryVariable(name)
    if (str === null) return []
    str = str.replaceAll("[", "").replaceAll("]", "")
    const arr = str.split(",");
    return arr
}

const setTeamRate = (team: Team, rate: string) => {
    const value = Number(rate)
    if (Number.isNaN(value)) return
    team.rate = value
}

const mergeInitData = (cacheData: CacheData | null) => {
    const defaultData = copyDefaultTeams();
    const urlNameArr: string[] = getUrlDate('name');
    if (urlNameArr.length !== 0) {
        urlNameArr[0] && (defaultData.A.name = decodeURI(urlNameArr[0]))
        urlNameArr[1] && (defaultData.B.name = decodeURI(urlNameArr[1]))
        urlNameArr[2] && (defaultData.C.name = decodeURI(urlNameArr[2]))
    }
    const urlRateArr: string[] = getUrlDate('rate');
    if (urlRateArr.length !== 0) {
        urlRateArr[0] && setTeamRate(defaultData.A, urlRateArr[0])
        urlRateArr[1] && setTeamRate(defaultData.B, urlRateArr[1])
        urlRateArr[2] && setTeamRate(defaultData.C, urlRateArr[2])
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
    const assignMode = useRef<"avg" | "max">("avg");
    // const assignBtnTip = useRef<any>(null);

    const tippyArr = useRef<Instance<Props>[]>([]);

    // const assignMod = useRef<number>(0)
    // const assignModSwitch = () => {
    //     const modNum = 2 //总共有模式数量
    //     assignMod.current += 1
    //     if (assignMod.current === modNum) {
    //         assignMod.current = 0
    //     }
    // }

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
            const arr = getValidTeams(teams)
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
        // assignMoney(assignMode.current);
    }

    const switchTeamStatus = (e: any) => {
        let el = e.target;
        let team = findTeam(el.dataset.teamid);
        if (!team) return
        let status = !team.status;
        el.dataset.status = status;
        team.money = 0;
        team.status = status
        setTeams({ ...teams });
        assignMoney(assignMode.current);
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
        return getTeamList(teams).map((team: Team, index: number) => {
            const status = team.status;
            let casePrize = "0.00";
            let profit = "0.00";
            let totalProfit = "0.00";
            let wrong = false
            if (status) {
                casePrize = getCashPrize(team).toFixed(2, Decimal.ROUND_DOWN);
                profit = getProfit(team).toFixed(2, Decimal.ROUND_DOWN);
                totalProfit = getAllProfit(teams, team).toFixed(2, Decimal.ROUND_DOWN);
                wrong = new Decimal(totalProfit).isNegative()
            }
            return <tr key={"team-" + index}>
                <td onClick={(e) => { switchTeamStatus(e) }} data-status={status} data-teamid={team.id}>{team.name}</td>
                {renderRate(team)}
                {renderMoney(team)}
                <td><div>{casePrize}</div></td>
                <td><div>{profit}</div></td>
                <td><div data-wrong={wrong}>{totalProfit}</div></td>
            </tr>
        })
    }

    const renderTotal = () => {
        const value = new Decimal(totalMoney || 0).toFixed(2, Decimal.ROUND_DOWN)
        return <tr className='ttotal'>
            <td>总金额 💰</td>
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
        const arr = getValidTeams(teams)
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
        const arr = getValidTeams(teams)
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
            const eq = team.id === id
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
        const cpTeams = mergeInitData(null)
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
        //特殊情况：如果三者rate相同
        if (teams.A.rate === teams.B.rate && teams.B.rate === teams.C.rate) {
            const avg = new Decimal(totalMoney).div(3).toNumber();
            teams.A.money = avg
            teams.B.money = avg
            teams.C.money = avg
            setTeams({ ...teams })
            return
        }
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

    //核心分配算法，分配两个
    const assignMoney2 = (smallRateTeam: Team, largeRateTeam: Team, assignCase: "avg" | "max") => {
        //计算过程
        const teamA = largeRateTeam;
        const teamB = smallRateTeam;
        //特殊情况：如果二者rate相同
        if(teamA.rate === teamB.rate) {
            const half = new Decimal(totalMoney).div(2).toNumber();
            largeRateTeam.money = half
            smallRateTeam.money = half;
        }else if (assignCase === "avg") { 
            assignMode.current = "avg"
            //默认的，稳健型投资：表示无论结果如何，所得收益都不会亏，即大于等于 0 ，且两者收益持平，买哪方都能获得一样的收益
            //M/a ≤ M/b ≤ A ≤ B，算出 A 的最小值
            //M/a ≤ M/b ≤ B ≤ M，算出 B 的最小值
            const moneyA = new Decimal(totalMoney).div(teamA.rate).toNumber(); 
            const moneyB = new Decimal(totalMoney).div(teamB.rate).toNumber();
            largeRateTeam.money = moneyA
            smallRateTeam.money = moneyB;
        }else if (assignCase === "max"){ 
            assignMode.current = "max"
            //高收益高风险，收益最高的投资：只要不亏钱，竟可能的获得更多收益
            const moneyA = new Decimal(totalMoney).div(teamA.rate).toNumber(); //A 要取最小值，不亏本的情况下
            const moneyB = new Decimal(totalMoney).sub(moneyA).toNumber(); //余额全部给 B，最大化 B 投资
            largeRateTeam.money = moneyA
            smallRateTeam.money = moneyB;
        }
        setTeams({ ...teams });
        return
    }

    //核心分配算法，分配一个
    const assignMoney1 = (team: Team) => {
        team.money = totalMoney;
        setTeams({ ...teams })
    }

    const assignMoney = (model: "avg" | "max" | undefined) => {
        if (totalMoney < 1) return
        const modelValue = model ?? assignMode.current;
        assignMode.current = modelValue;
        const arr: Team[] = getTeamArr(teams)
        switch (arr.length) {
            case 3:
                assignMoney3(); //由于3方案必然存在亏损情况，所以无论是稳健收益还是最大收益算法，都只有一种分配方案
                break;
            case 2:
                assignMoney2(arr[0], arr[1], modelValue)
                break;
            case 1:
                assignMoney1(arr[0])
                break;
            default:
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
                    <div className='reset'>
                        <button className='reset-btn' onClick={resetData}>
                            reset
                        </button>
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
                                <div className='assign'>
                                    <button className='assign-btn' onClick={(e) => { assignMoney("avg") }}>
                                        稳健收益
                                    </button>
                                </div>
                                <div className='assign'>
                                    <button className='assign-btn' onClick={(e) => { assignMoney("max") }}>
                                        最大收益
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
