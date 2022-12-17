import './App.css';
import Decimal from 'decimal.js';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from 'scrollreveal';
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

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
const getAllProfit = (teams: Teams, item: Team): Decimal => {
    let allCharge: Decimal = getAllCharge(teams)
    let cashPrize: Decimal = getCashPrize(item)
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

function App() {
    useEffect(() => {
        let sr = ScrollReveal({ reset: true });
        return () => {
            sr.destroy()
        }
    })
    const cacheData = getCacheData();
    const initTeamsData: Teams = { ...copyDefaultTeams(), ...cacheData?.teams }

    const [teams, setTeams] = useState<Teams>(initTeamsData);
    const [totalMoney, setTotalMoney] = useState<number>(cacheData?.total || 100);
    const totalRef = useRef<HTMLInputElement>(null);
    const assignBtnTip = useRef<any>(null);

    const tippyArr = useRef<Instance<Props>[]>([]);

    let isFirstLoad = useRef<boolean>(true)
    useEffect(() => {
        if (!isFirstLoad.current) return
        isFirstLoad.current = false
        const moneyInputs = document.querySelectorAll("input[data-name=money]");
        tippyArr.current = tippy(moneyInputs, {
            // default
            arrow: true,
            content: defaultContent,
            animation: 'scale',
            hideOnClick: false,
        });
        const assignBtnE = document.querySelector(".assign-btn");
        assignBtnE && (assignBtnTip.current = tippy(assignBtnE, {
            // default
            arrow: true,
            content: "请先reset表单数据",
            animation: 'scale',
            hideOnClick: false,
        }));
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
            if (num >= 100000) {
                num = 100000
            }
            el.value = new Decimal(num).toString()
            team.money = num
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
                // console.log(totalMoney)
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
        const tip = assignBtnTip.current as Instance<Props>
        tip.disable()
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
        const a = large.rate
        const b = samll.rate
        // M ≥ A ≥ M(2-b)/(a-b)
        const A = new Decimal(totalMoney).mul(new Decimal(2).sub(b)).div(new Decimal(a).sub(b))
        const B = new Decimal(totalMoney).sub(A)
        if (A.isFinite() || B.isFinite()) {
            let moneyA = A.toNumber()
            let moneyB = B.toNumber()
            if (A.greaterThanOrEqualTo(totalMoney)) {
                moneyA = totalMoney;
            } else if (A.lessThanOrEqualTo(0)) {
                moneyA = 1
            }
            if (B.greaterThanOrEqualTo(totalMoney)) {
                moneyB = totalMoney - 1;
            } else if (B.lessThanOrEqualTo(0)) {
                moneyB = 1;
            }
            large.money = moneyA
            samll.money = moneyB
        } else {
            large.money = new Decimal(totalMoney).div(2).toNumber()
            samll.money = new Decimal(totalMoney).sub(large.money).toNumber()
        }

        setTeams({ ...teams })
    }

    const assignMoney = () => {
        if (totalMoney < 1) return
        const noZeroArr: Team[] = []
        getTeamArr(teams).forEach((team) => {
            if (team.money !== 0) {
                noZeroArr.push(team)
            }
        })
        const tip = assignBtnTip.current as Instance<Props>
        //当2个都不为0时，执行2分配方案
        if (noZeroArr.length === 2) {
            tip.disable()
            assignMoney2(noZeroArr[0], noZeroArr[1])
        } else if (noZeroArr.length === 0) { //当全部都为0时，执行3分配方案
            tip.disable()
            assignMoney3()
        } else {
            tip.enable()
            tip.show()
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
                            <li>Aa ≥ Bb ≥ Cc</li>
                            <li>Cc ≥ Aa ≥ Bb</li>
                            <li>Bb ≥ Cc ≥ Aa</li>
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
                                    <button className='reset-btn' onClick={resetData}>reset</button>
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
                    <h3>设</h3>
                    <p>
                        总预算：M
                        <br />设金额：A={teams.A.name}，B={teams.B.name}，C={teams.C.name}
                        <br /> 设赔率：a={teams.A.name}，b={teams.B.name}，c={teams.C.name}
                    </p>

                    <h3>方程式</h3>
                    <p>
                        如果{teams.A.name}：
                        <br />① Aa - A - B - C ≥ 0<br />&nbsp;=&gt;&gt;&nbsp;  A(a-1) ≥ B + C
                        <br /> 如果{teams.B.name}：
                        <br /> ② Bb - A - B - C ≥ 0<br /> &nbsp;=&gt;&gt;&nbsp; B(b-1) ≥ A + C
                        <br /> 如果{teams.C.name}：
                        <br /> ③ Cc - A - B - C ≥ 0<br /> &nbsp;=&gt;&gt;&nbsp; C(c-1) ≥ A + B
                        <br /> 总预算：
                        <br /> ④ A + B + C = M
                    </p>

                    <h3>化简</h3>
                    <p>
                        将 ① - ② 得：
                        ⑤ Aa ≥ Bb
                        <br /> =&gt;&gt; A ≥ Bb/a
                        <br /> =&gt;&gt;  Aa/b ≥ B
                        <br /> 将 ② - ③ 得：
                        ⑥ Bb ≥ Cc
                        <br /> =&gt;&gt; B ≥ Cc/b
                        <br /> =&gt;&gt;  Bb/c ≥ C
                        <br /> 将 ③ - ① 得：
                        ⑦ Cc ≥ Aa
                        <br /> =&gt;&gt; C ≥ Aa/c
                        <br /> =&gt;&gt;  Cc/a ≥ A
                    </p>

                    <h3>最终解</h3>
                    <p>
                        将 ⑤ 与 ⑥ 组合得：
                        ⑧ Aa ≥ Bb ≥ Cc
                        <br /> 将 ⑤ 与 ⑦ 组合得：
                        ⑨ Cc ≥ Aa ≥ Bb
                        <br /> 将 ⑥ 与 ⑦ 组合得：
                        ⑩ Bb ≥ Cc ≥ Aa
                    </p>

                    <h3>求各注的金额</h3>
                    <p>
                        A + Aa/b + Aa/c = M
                        <br /> Bb/a + B + Bb/c = M
                        <br /> Cc/a + Cc/b + C = M
                    </p>

                    <h3>资金分配三注方案</h3>
                    <p>
                        A = M/(1 + a/b + a/c)
                        <br />
                        B = M/(b/a + 1 + b/c)
                        <br />
                        C = M/(c/a + c/b + 1)
                    </p>

                    <h3>资金分配两注方案</h3>
                    <p>
                        M = A + B
                        <br />Aa - A - B ≥ 0 <br />  =&gt;&gt; Aa - A - M + A ≥ 0 <br /> =&gt;&gt; Aa ≥ M
                        <br />
                        <br />Bb - B - A ≥ 0 <br />  =&gt;&gt; Bb - B - M + B ≥ 0 <br /> =&gt;&gt; Bb ≥ M
                        <br />
                        <br />Aa + Bb ≥ 2M
                        <br />Aa + Mb - Ab ≥ 2M
                        <br />A(a-b) ≥ M(2-b)
                        <br />
                        <br />则: M ≥ A ≥ M(2-b)/(a-b)
                        <br />
                        <br />M - B ≥ M(2-b)/(a-b)
                        <br /> 0  ≤ B ≤ M - M(2-b)/(a-b)
                        <br />
                        <br />则: 0  ≤ B ≤ A
                    </p>

                    <br />
                    <br />
                </section>


            </article>

            <footer className='footer'>
                温馨提示：成功没有捷径 ，努力造就明天
                <br />彩票只是娱乐，而非致富捷径
            </footer>
        </div >
    );
}





export default App;
