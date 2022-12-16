import './App.css';
import Decimal from 'decimal.js';
import { useEffect, useRef, useState } from 'react';
import ScrollReveal from 'scrollreveal'
import tippy, { Instance, Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

function App() {
  useEffect(() => {
    let sr = ScrollReveal({ reset: true });
    return () => {
      sr.destroy()
    }
  })

  const defaultData: Teams = {
    A: NewTeam(1, "A胜", "0.00", "1.000"),
    B: NewTeam(2, "B胜", "0.00", "1.000"),
    D: NewTeam(3, "平局", "0.00", "1.000")
  }

  const assignTeamValue = (team: Team, cache: CacheTeam) => {
    cache.id && (team.id = cache.id)
    cache.name && (team.name = cache.name)
    cache.rate && (team.rate = new Decimal(cache.rate))
    cache.money && (team.money = new Decimal(cache.money))
  }

  const TeamToCache = (team: Team): CacheTeam => {
    return { ...team, rate: team.rate.toFixed(3, Decimal.ROUND_DOWN), money: team.money.toFixed(2, Decimal.ROUND_DOWN) }
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
    //三种情况
    //case1：A队伍赢
    setProfitA(getProfit(A).toString());
    //case2：B队伍赢
    setProfitB(getProfit(B).toString());
    //case3：平局
    setProfitD(getProfit(D).toString());
  }

  const inputArateRef = useRef<HTMLInputElement>(null);
  const inputAmoneyRef = useRef<HTMLInputElement>(null);
  const inputBrateRef = useRef<HTMLInputElement>(null);
  const inputBmoneyRef = useRef<HTMLInputElement>(null);
  const inputDrateRef = useRef<HTMLInputElement>(null);
  const inputDmoneyRef = useRef<HTMLInputElement>(null);

  const handleInputValue = (ref: React.RefObject<HTMLInputElement>): string => {
    let value = ref.current ? ref.current.value : "0.00";
    if (!ref.current) return value
    value = value.replaceAll("。", ".")
    value = value.replaceAll("、", ".")
    value = value.replaceAll("，", ".")
    ref.current.value = value
    return value
  }

  const inputOnChange = (ref: React.RefObject<HTMLInputElement>, team: Team, setfn: React.Dispatch<React.SetStateAction<Team>>) => {
    const value = handleInputValue(ref)
    // const pattern = /^(\-|\+)?\d+(\.)?(\d+)?$/
    handleInputValue(ref)
    const pattern = /^(-|\+)?\d+\.$/
    if (pattern.test(value)) {
      return
    }
    const typeName = ref.current?.dataset.name
    if (typeName === "rate") {
      let res = new Decimal(Number(value) || 1);
      if (res.toNumber() === 0) {
        res = new Decimal("1.000")
      }
      setfn({ ...team, rate: res })
    } else if (typeName === "money") {
      const res = new Decimal(Number(value) || 0);
      setfn({ ...team, money: res })
    }
    calculate()
  }

  const showInput = (ref: React.RefObject<HTMLInputElement>, value: string) => {
    if (ref.current) {
      ref.current.style.display = "inline-block";
      ref.current.value = new Decimal(value).toString()  //常规
      setTimeout(() => {
        ref.current?.focus()
        if (ref.current?.dataset.name === "money") {
          setTippyContent(ref)
        }
      });
    }
  }

  //输入完成之后的核心事件
  const hideInput = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.style.display = "none";
    }
    // setA(A)
    // setB(B)
    // setD(D)
    setTimeout(() => {
      setCacheData({ A, B, D })
    })
    calculate()
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
    const profits = [profitA, profitB, profitD];
    return list.map((item, index) => {
      const rateRef = rateRefs[index];
      const moneyRef = moneyRefs[index];
      const setf = sets[index];
      const rate = new Decimal(item.rate).toFixed(3, Decimal.ROUND_DOWN)
      const money = new Decimal(item.money).toFixed(2, Decimal.ROUND_DOWN)
      const profit = profits[index]
      return <tr key={index}>
        <td>{item.name}</td>
        <td><div key={"rate-" + index} onMouseDown={() => { showInput(rateRef, rate) }}>{rate}
          <input data-id={item.id} data-name="rate" type="text" ref={rateRef} onKeyUp={(e) => { enterEvent(e, rateRef) }} onChange={() => { inputOnChange(rateRef, item, setf) }} onFocus={() => { formatInput(rateRef, rate) }} onBlur={() => { hideInput(rateRef) }} /></div></td>
        <td><div key={"money-" + index} onMouseDown={() => { showInput(moneyRef, money) }}>{money}
          <input data-id={item.id} data-name="money" type="text" ref={moneyRef} onKeyUp={(e) => { enterEvent(e, moneyRef) }} onChange={() => { inputOnChange(moneyRef, item, setf) }} onFocus={() => { formatInput(moneyRef, money) }} onBlur={() => { hideInput(moneyRef) }} /></div></td>
        <td><div>{CashPrize(item).toFixed(2, Decimal.ROUND_DOWN)}</div></td>
        <td><div>{SingleProfit(item).toFixed(2, Decimal.ROUND_DOWN)} </div></td>
        <td><div>{profit}</div></td>
      </tr>
    })
  }

  const addInputTippy = (ref: React.RefObject<HTMLInputElement>, content: string) => {
    const el = ref.current as Element;
    const res = tippy(el, {
      // default
      arrow: true,
      content: content,
      animation: 'scale',
      hideOnClick: false,
    });
    return res
  }

  const tipA = useRef<unknown>(null)
  const tipB = useRef<unknown>(null)
  const tipD = useRef<unknown>(null)

  let isFirstLoad = useRef<boolean>(true)
  useEffect(() => {
    if (!isFirstLoad.current) return
    isFirstLoad.current = false
    calculate()  //渲染完成后，计算一次
    tipA.current = addInputTippy(inputAmoneyRef, defaultContent);
    tipB.current = addInputTippy(inputBmoneyRef, defaultContent);
    tipD.current = addInputTippy(inputDmoneyRef, defaultContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toDippy = (item: unknown) => {
    return item as Instance<Props>
  }

  //提示逻辑
  //赔率最大者，优先配置money
  const decimalToNumber = (num: Decimal): number => {
    return num.toNumber()
  }

  // const teamList = useRef<group[]>([newGroup(A, setA), newGroup(B, setB), newGroup(D, setD)]);
  const teamList = useRef<Team[]>([A, B, D]);

  const resetTeamList = () => {
    teamList.current = [A, B, D]
  }

  const sortTeamList = () => {
    teamList.current.sort((a, b) => {
      return decimalToNumber(a.rate) - decimalToNumber(b.rate)
    })
  }

  //检查数据是否已经设置好，设置好才能开启tip
  const dataVerify = (ref: React.RefObject<HTMLInputElement>): boolean => {
    const list = [A, B, D];
    const moneyRefs = [inputAmoneyRef, inputBmoneyRef, inputDmoneyRef];
    let count = 0;
    list.forEach((item, index) => {
      if (moneyRefs[index] === ref) {
        //不管当前是不是0，如果另外两个是0.则当前为默认提示
        return
      }
      if (new Decimal(item.money).toNumber() === 0) {
        count += 1
      }
    })
    if (count >= 2) { //有两个以上都为0
      return false
    }
    return true
  }


  const defaultContent = "请下注";

  const getMaxContent = () => {
    const minDec = CashPrize(teamList.current[1])
    if (minDec.toNumber() === 0) {
      return defaultContent
    }
    const min = minDec.div(teamList.current[2].rate).toFixed(2, Decimal.ROUND_DOWN)
    return `当前值 ≥ ${min}`
  }

  const getMidContent = () => {
    const maxDec = CashPrize(teamList.current[2])
    const minDec = CashPrize(teamList.current[0])
    const max = maxDec.div(teamList.current[1].rate).toFixed(2, Decimal.ROUND_DOWN)
    const min = minDec.div(teamList.current[1].rate).toFixed(2, Decimal.ROUND_DOWN)
    if (maxDec.toNumber() === 0 && minDec.toNumber() === 0) {
      return defaultContent;
    } else if (maxDec.toNumber() === 0) {
      return `当前值 ≥ ${min}`
    } else if (minDec.toNumber() === 0) {
      return `${max} ≥ 当前值`
    } else {
      return `${max} ≥ 当前值 ≥ ${min}`
    }
  }

  const getMinContent = () => {
    const maxDec = CashPrize(teamList.current[1])
    if (maxDec.toNumber() === 0) {
      return defaultContent
    }
    const max = maxDec.div(teamList.current[0].rate).toFixed(2, Decimal.ROUND_DOWN)
    return `${max} ≥ 当前值`
  }


  const setTippyContent = (ref: React.RefObject<HTMLInputElement>) => {
    if (!ref.current) return
    resetTeamList() //必须重新初始化数据
    sortTeamList() //开始前，需要排序一下
    const ok = dataVerify(ref)
    const id = ref.current.dataset.id;
    teamList.current.forEach((team, index) => {
      if (ref.current && String(team.id) === id) {
        let msg = ""
        switch (true) {
          case new Decimal(team.rate).toNumber() === 0:
            msg = "请先设置赔率";
            break;
          case !ok:
            msg = defaultContent;
            break
          case index === 0:
            msg = getMinContent();
            break
          case index === 1:
            msg = getMidContent();
            break
          case index === 2:
            msg = getMaxContent();
            break
          default:
            msg = defaultContent;
            break;
        }
        switch (id) {
          case "1":
            toDippy(tipA.current).setContent(msg)
            break
          case "2":
            toDippy(tipB.current).setContent(msg)
            break
          case "3":
            toDippy(tipD.current).setContent(msg)
            break
        }
      }
    })
  }

  const resetData = () => {
    localStorage.removeItem("teams");
    window.location.reload();
  }

  return (
    <div className="App">
      <header className="App-header">
        彩票购买方案
      </header>
      <article className='App-body'>
        <section className='App-body-1'>
          <div className='base-rules'>
            <h3>基本公式</h3>
            <ul>
              <li>Aa ≥ Bb ≥ Cc</li>
              <li>Cc ≥ Aa ≥ Bb</li>
              <li>Bb ≥ Cc ≥ Aa</li>
            </ul>
            <br />
            <div><button onClick={resetData}>reset</button></div>
          </div>
          <table className='App-body-table'>
            <thead>
              <tr>
                <th>下注</th>
                <th>赔率</th>
                <th>金额</th>
                <th>兑奖</th>
                <th>收益</th>
                <th>总收益</th>
              </tr>
            </thead>
            <tbody>
              {renderTr()}
            </tbody>
          </table>
          {/* <div>
            {showResult()}
          </div> */}
          <div className='calculate-box'>
            <button className='calculate-btn' onClick={calculate}>
              计算
            </button>
          </div>

        </section>
        <section className='App-body-2'>
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


      </article>

      <footer className='footer'>
        温馨提示：成功没有捷径 ，努力造就明天
        <br />彩票只是娱乐，而非致富捷径
      </footer>
    </div >
  );
}

//新建
function NewTeam(id: number, name: string, money: Decimal.Value, rate: Decimal.Value): Team {
  return {
    id: id,
    name: name,
    money: new Decimal(money),
    rate: new Decimal(rate),
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
