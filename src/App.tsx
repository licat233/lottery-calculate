import './App.css';
import Decimal from 'decimal.js';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from 'scrollreveal'

function App() {
  useEffect(() => {
    let sr = ScrollReveal({ reset: true });
    return () => {
      sr.destroy()
    }
  })

  const defaultData: Teams = {
    A: NewTeam("A胜", "0.00", "1.000"),
    B: NewTeam("B胜", "0.00", "1.000"),
    D: NewTeam("平局", "0.00", "1.000")
  }

  const assignTeamValue = (team: Team, cache: CacheTeam) => {
    team.name = cache.name;
    team.rate = new Decimal(cache.rate);
    team.money = new Decimal(cache.money);
  }

  const TeamToCache = (team: Team): CacheTeam => {
    return {
      name: team.name,
      rate: team.rate.toFixed(3, Decimal.ROUND_DOWN),
      money: team.money.toFixed(2, Decimal.ROUND_DOWN)
    }
  }

  const setCacheData = (team: Teams) => {
    const cachedata: CacheTeams = {
      A: TeamToCache(team.A),
      B: TeamToCache(team.B),
      D: TeamToCache(team.D)
    }
    localStorage.setItem("teams", JSON.stringify(cachedata))
  }

  const getCacheData = (): void => {
    const body = localStorage.getItem("teams");
    if (!body) return;
    try {
      const cacheTeams: CacheTeams = JSON.parse(body)
      if (cacheTeams.A) assignTeamValue(defaultData.A, cacheTeams.A)
      if (cacheTeams.B) assignTeamValue(defaultData.B, cacheTeams.B)
      if (cacheTeams.D) assignTeamValue(defaultData.D, cacheTeams.D)
    } catch (error) {
      localStorage.removeItem("teams");
    }
    return;
  }

  getCacheData();

  // 队伍A
  const [A, setA] = useState<Team>(defaultData.A);

  // 队伍B
  const [B, setB] = useState<Team>(defaultData.B);

  // 平局
  const [D, setD] = useState<Team>(defaultData.D);

  const getAllCharge = (): Decimal => {
    return A.money.add(B.money).add(D.money)
  }

  const getProfit = (item: Team): Decimal => {
    let allCharge: Decimal = getAllCharge()
    let cashPrize: Decimal = CashPrize(item)
    //奖金 - 投入 = 收益
    return cashPrize.sub(allCharge)
  }

  const [profitA, setProfitA] = useState<string>("0.00");
  const [profitB, setProfitB] = useState<string>("0.00");
  const [profitD, setProfitD] = useState<string>("0.00");

  const calculate = () => {
    // let profit: Decimal

    //三种情况
    //case1：A队伍赢
    // profit = getProfit(A)
    setProfitA(getProfit(A).toString());
    // console.log("A队伍赢，收益：", profit.toNumber())

    //case2：B队伍赢
    // profit = getProfit(B)
    setProfitB(getProfit(B).toString());
    // console.log("B队伍赢，收益：", profit.toNumber())

    //case3：平局
    // profit = getProfit(D)
    setProfitD(getProfit(D).toString());
    // console.log("平局，收益：", profit.toNumber())
  }

  const showResult = () => {
    return <>
      <div>
        <ul>
          <li>如果{A.name}胜，总收益：<span>{profitA}</span></li>
          <li>如果{B.name}胜，总收益：<span>{profitB}</span></li>
          <li>如果{D.name}，总收益：<span>{profitD}</span></li>
        </ul>
      </div>
    </>
  }

  const inputArateRef = useRef<HTMLInputElement>(null);
  const inputAmoneyRef = useRef<HTMLInputElement>(null);
  const inputBrateRef = useRef<HTMLInputElement>(null);
  const inputBmoneyRef = useRef<HTMLInputElement>(null);
  const inputDrateRef = useRef<HTMLInputElement>(null);
  const inputDmoneyRef = useRef<HTMLInputElement>(null);

  const inputOverEvent = (ref: React.RefObject<HTMLInputElement>, team: Team, setfn: React.Dispatch<React.SetStateAction<Team>>, typeName: string) => {
    const value = ref.current ? ref.current.value : "0.00";
    // const pattern = /^(\-|\+)?\d+(\.)?(\d+)?$/
    const pattern = /^(-|\+)?\d+\.$/
    if (pattern.test(value)) {
      return
    }
    const res = new Decimal(Number(value) || 0);
    if (typeName === "rate") {
      setfn({ ...team, rate: res })
    } else if (typeName === "money") {
      setfn({ ...team, money: res })
    }
  }

  const showInput = (ref: React.RefObject<HTMLInputElement>, value: string) => {
    if (ref.current) {
      ref.current.style.display = "inline-block";
      ref.current.value = value  //保留两位小数
      setTimeout(() => {
        ref.current?.focus()
      });
    }
  }

  const hideInput = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.style.display = "none";
    }
    setCacheData({ A, B, D })
  }

  const enterEvent = (e: any, ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      if (e.keyCode === 13) {
        hideInput(ref)
      }
    }
  }

  const formatInput = (ref: React.RefObject<HTMLInputElement>, value: string) => {
    if (ref.current) {
      ref.current.style.display = "inline-block";
      ref.current.value = new Decimal(value).toString()  //常规number
    }
  }

  const renderTr = () => {
    const list = [A, B, D];
    const sets = [setA, setB, setD];
    const rateRefs = [inputArateRef, inputBrateRef, inputDrateRef];
    const moneyRefs = [inputAmoneyRef, inputBmoneyRef, inputDmoneyRef];
    return list.map((item, index) => {
      const rateRef = rateRefs[index];
      const moneyRef = moneyRefs[index];
      const setf = sets[index];
      const rate = new Decimal(item.rate).toFixed(3, Decimal.ROUND_DOWN)
      const money = new Decimal(item.money).toFixed(2, Decimal.ROUND_DOWN)
      return <tr key={index}>
        <td>{item.name}</td>
        <td><div key={"rate-" + index} onMouseDown={() => { showInput(rateRef, rate) }}>{rate}
          <input type="text" ref={rateRef} onKeyUp={(e) => { enterEvent(e, rateRef) }} onChange={() => { inputOverEvent(rateRef, item, setf, "rate") }} onFocus={() => { formatInput(rateRef, rate) }} onBlur={() => { hideInput(rateRef) }} /></div></td>
        <td><div key={"money-" + index} onMouseDown={() => { showInput(moneyRef, money) }}>{money}
          <input type="text" ref={moneyRef} onKeyUp={(e) => { enterEvent(e, moneyRef) }} onChange={() => { inputOverEvent(moneyRef, item, setf, "money") }} onFocus={() => { formatInput(moneyRef, money) }} onBlur={() => { hideInput(moneyRef) }} /></div></td>
        <td><div>{CashPrize(item).toFixed(2, Decimal.ROUND_DOWN)}</div></td>
        <td><div>{SingleProfit(item).toFixed(2, Decimal.ROUND_DOWN)} </div></td>
      </tr>
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        彩票购买方案
      </header>
      <article className='App-body'>
        <section className='App-body-1'>
          <h3>计算过程</h3>
          <p>
            设金额：A={A.name}，B={B.name}，C={D.name} <br /> 设赔率：a={A.name}，b={B.name}，c={D.name}
          </p>

          <h3>列方程式</h3>
          <p>
            如果{A.name}赢：
            <br />① Aa - A - B - C ≥ 0 &nbsp;=&gt;&gt;&nbsp;  A(a-1) ≥ B + C
            <br /> 如果{B.name}赢：
            <br /> ② Bb - A - B - C ≥ 0 &nbsp;=&gt;&gt;&nbsp; B(b-1) ≥ A + C
            <br /> 如果{D.name}：
            <br /> ③ Cc - A - B - C ≥ 0 &nbsp;=&gt;&gt;&nbsp; C(c-1) ≥ A + B
          </p>

          <h3>化简</h3>
          <p>
            将 ① - ② 得：
            ④ Aa ≥ Bb
            <br /> 将 ② - ③ 得：
            ⑤ Bb ≥ Cc
            <br /> 将 ③ - ① 得：
            ⑥ Cc ≥ Aa
          </p>

          <h3>最终解</h3>
          <p>
            将 ④ 与 ⑤ 组合得：
            ⑦ Aa ≥ Bb ≥ Cc
            <br /> 将 ④ 与 ⑥ 组合得：
            ⑧ Cc ≥ Aa ≥ Bb
            <br /> 将 ⑤ 与 ⑥ 组合得：
            ⑨ Bb ≥ Cc ≥ Aa
          </p>
        </section>

        <section className='App-body-1'>
          <table className='App-body-table'>
            <thead>
              <tr>
                <th>下注</th>
                <th>赔率</th>
                <th>金额</th>
                <th>兑奖</th>
                <th>收益</th>
              </tr>
            </thead>
            <tbody>
              {renderTr()}
            </tbody>
          </table>
          <div>
            {showResult()}
          </div>
          <div className='calculate-box'>
            <button className='calculate-btn' onClick={calculate}>
              计算
            </button>
          </div>

        </section>
      </article>

      <footer className='footer'>
        温馨提示：成功没有捷径 ，努力造就明天
        <br />彩票只是娱乐，而非致富捷径
      </footer>
    </div >
  );
}

//新建
function NewTeam(name: string, money: Decimal.Value, rate: Decimal.Value): Team {
  return {
    name: name,
    money: new Decimal(money),
    rate: new Decimal(rate)
  }
}

//兑奖
function CashPrize(item: Team): Decimal {
  return new Decimal(item.money).mul(new Decimal(item.rate));
}

//收益
function SingleProfit(item: Team): Decimal {
  return CashPrize(item).sub(new Decimal(item.money));
}

export default App;
