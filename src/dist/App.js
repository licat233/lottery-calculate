"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
require("./App.css");
var decimal_js_1 = require("decimal.js");
var react_1 = require("react");
var scrollreveal_1 = require("scrollreveal");
var tippy_js_1 = require("tippy.js");
require("tippy.js/dist/tippy.css");
require("tippy.js/animations/scale.css");
function App() {
    react_1.useEffect(function () {
        var sr = scrollreveal_1["default"]({ reset: true });
        return function () {
            sr.destroy();
        };
    });
    var defaultData = {
        A: NewTeam(1, "甲胜", "0.00", "1.000"),
        B: NewTeam(2, "乙胜", "0.00", "1.000"),
        D: NewTeam(3, "平局", "0.00", "1.000")
    };
    var _a = react_1.useState(new decimal_js_1["default"](100)), totalMoney = _a[0], setTotalMoney = _a[1];
    var totalRef = react_1.useRef(null);
    var assignTeamValue = function (team, cache) {
        cache.id && (team.id = cache.id);
        cache.name && (team.name = cache.name);
        cache.rate && (team.rate = new decimal_js_1["default"](cache.rate));
        cache.money && (team.money = new decimal_js_1["default"](cache.money));
    };
    var TeamToCache = function (team) {
        return __assign(__assign({}, team), { rate: team.rate.toFixed(3, decimal_js_1["default"].ROUND_DOWN), money: team.money.toFixed(2, decimal_js_1["default"].ROUND_DOWN) });
    };
    var setCacheData = function () {
        var cachedata = {
            A: TeamToCache(A),
            B: TeamToCache(B),
            D: TeamToCache(D)
        };
        localStorage.setItem("teams", JSON.stringify(cachedata));
    };
    var getCacheData = function () {
        var body = localStorage.getItem("teams");
        if (!body)
            return;
        try {
            var cacheTeams = JSON.parse(body);
            if (cacheTeams.A)
                assignTeamValue(defaultData.A, cacheTeams.A);
            if (cacheTeams.B)
                assignTeamValue(defaultData.B, cacheTeams.B);
            if (cacheTeams.D)
                assignTeamValue(defaultData.D, cacheTeams.D);
        }
        catch (error) {
            localStorage.removeItem("teams");
        }
        return;
    };
    getCacheData();
    // 队伍A
    var _b = react_1.useState(defaultData.A), A = _b[0], setA = _b[1];
    // 队伍B
    var _c = react_1.useState(defaultData.B), B = _c[0], setB = _c[1];
    // 平局
    var _d = react_1.useState(defaultData.D), D = _d[0], setD = _d[1];
    var getAllCharge = function () {
        return A.money.add(B.money).add(D.money);
    };
    var getProfit = function (item) {
        var allCharge = getAllCharge();
        var cashPrize = CashPrize(item);
        //奖金 - 投入 = 收益
        return cashPrize.sub(allCharge);
    };
    var _e = react_1.useState("0.00"), profitA = _e[0], setProfitA = _e[1];
    var _f = react_1.useState("0.00"), profitB = _f[0], setProfitB = _f[1];
    var _g = react_1.useState("0.00"), profitD = _g[0], setProfitD = _g[1];
    var calculate = function () {
        //三种情况
        //case1：A队伍赢
        setProfitA(getProfit(A).toFixed(2, decimal_js_1["default"].ROUND_DOWN));
        //case2：B队伍赢
        setProfitB(getProfit(B).toFixed(2, decimal_js_1["default"].ROUND_DOWN));
        //case3：平局
        setProfitD(getProfit(D).toFixed(2, decimal_js_1["default"].ROUND_DOWN));
        setTimeout(function () {
            setCacheData();
        });
    };
    var inputArateRef = react_1.useRef(null);
    var inputAmoneyRef = react_1.useRef(null);
    var inputBrateRef = react_1.useRef(null);
    var inputBmoneyRef = react_1.useRef(null);
    var inputDrateRef = react_1.useRef(null);
    var inputDmoneyRef = react_1.useRef(null);
    var handleInputValue = function (ref) {
        var value = ref.current ? ref.current.value : "0.00";
        if (!ref.current)
            return value;
        value = value.replaceAll("。", ".");
        value = value.replaceAll("、", ".");
        value = value.replaceAll("，", ".");
        ref.current.value = value;
        return value;
    };
    var inputOnChange = function (ref, team, setfn) {
        var _a;
        var value = handleInputValue(ref);
        // const pattern = /^(\-|\+)?\d+(\.)?(\d+)?$/
        var pattern = /^(-|\+)?\d+\.$/;
        if (pattern.test(value)) {
            return;
        }
        var typeName = (_a = ref.current) === null || _a === void 0 ? void 0 : _a.dataset.name;
        if (typeName === "rate") {
            var res = new decimal_js_1["default"](Number(value) || 1);
            if (res.toNumber() === 0) {
                res = new decimal_js_1["default"]("1.000");
            }
            team.rate = res;
        }
        else if (typeName === "money") {
            var res = new decimal_js_1["default"](Number(value) || 0);
            team.money = res;
        }
        setfn(team);
        setTimeout(function () {
            calculate();
        });
    };
    var showInput = function (ref, value) {
        if (ref.current) {
            ref.current.style.display = "inline-block";
            ref.current.value = new decimal_js_1["default"](value).toString(); //常规
            setTimeout(function () {
                var _a, _b;
                (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus();
                if (((_b = ref.current) === null || _b === void 0 ? void 0 : _b.dataset.name) === "money") {
                    setTippyContent(ref);
                }
            });
        }
    };
    //输入完成之后的核心事件
    var hideInput = function (ref) {
        if (ref.current) {
            ref.current.style.display = "none";
        }
        calculate();
        setTimeout(function () {
            setCacheData();
        });
    };
    var enterEvent = function (e, ref) {
        if (ref.current) {
            if (e.keyCode === 13) {
                hideInput(ref);
            }
        }
    };
    var formatInput = function (ref, value) {
        if (ref.current) {
            ref.current.style.display = "inline-block";
            ref.current.value = new decimal_js_1["default"](value).toString(); //常规number
        }
    };
    var renderTr = function () {
        var list = [A, B, D];
        var sets = [setA, setB, setD];
        var rateRefs = [inputArateRef, inputBrateRef, inputDrateRef];
        var moneyRefs = [inputAmoneyRef, inputBmoneyRef, inputDmoneyRef];
        var profits = [profitA, profitB, profitD];
        return list.map(function (item, index) {
            var rateRef = rateRefs[index];
            var moneyRef = moneyRefs[index];
            var setf = sets[index];
            var rate = new decimal_js_1["default"](item.rate).toFixed(3, decimal_js_1["default"].ROUND_DOWN);
            var money = new decimal_js_1["default"](item.money).toFixed(2, decimal_js_1["default"].ROUND_DOWN);
            var toatlProfit = profits[index];
            return React.createElement("tr", { key: index },
                React.createElement("td", null, item.name),
                React.createElement("td", null,
                    React.createElement("div", { key: "rate-" + index, onClick: function () { showInput(rateRef, rate); } },
                        rate,
                        React.createElement("input", { maxLength: 8, "data-id": item.id, "data-name": "rate", type: "text", ref: rateRef, onKeyUp: function (e) { enterEvent(e, rateRef); }, onChange: function () { inputOnChange(rateRef, item, setf); }, onFocus: function () { formatInput(rateRef, rate); }, onBlur: function () { hideInput(rateRef); } }))),
                React.createElement("td", null,
                    React.createElement("div", { key: "money-" + index, onClick: function () { showInput(moneyRef, money); } },
                        money,
                        React.createElement("input", { maxLength: 10, "data-id": item.id, "data-name": "money", type: "text", ref: moneyRef, onKeyUp: function (e) { enterEvent(e, moneyRef); }, onChange: function () { inputOnChange(moneyRef, item, setf); }, onFocus: function () { formatInput(moneyRef, money); }, onBlur: function () { hideInput(moneyRef); } }))),
                React.createElement("td", null,
                    React.createElement("div", null, CashPrize(item).toFixed(2, decimal_js_1["default"].ROUND_DOWN))),
                React.createElement("td", null,
                    React.createElement("div", null,
                        SingleProfit(item).toFixed(2, decimal_js_1["default"].ROUND_DOWN),
                        " ")),
                React.createElement("td", null,
                    React.createElement("div", null, toatlProfit)));
        });
    };
    var renderTeam = function () {
    };
    var addInputTippy = function (ref, content) {
        var el = ref.current;
        var res = tippy_js_1["default"](el, {
            // default
            arrow: true,
            content: content,
            animation: 'scale',
            hideOnClick: false
        });
        return res;
    };
    var tipA = react_1.useRef(null);
    var tipB = react_1.useRef(null);
    var tipD = react_1.useRef(null);
    var isFirstLoad = react_1.useRef(true);
    react_1.useEffect(function () {
        if (!isFirstLoad.current)
            return;
        isFirstLoad.current = false;
        calculate(); //渲染完成后，计算一次
        tipA.current = addInputTippy(inputAmoneyRef, defaultContent);
        tipB.current = addInputTippy(inputBmoneyRef, defaultContent);
        tipD.current = addInputTippy(inputDmoneyRef, defaultContent);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var toDippy = function (item) {
        return item;
    };
    //提示逻辑
    //赔率最大者，优先配置money
    var decimalToNumber = function (num) {
        return num.toNumber();
    };
    // const teamList = useRef<group[]>([newGroup(A, setA), newGroup(B, setB), newGroup(D, setD)]);
    var teamList = react_1.useRef([A, B, D]);
    var resetTeamList = function () {
        teamList.current = [A, B, D];
    };
    var sortTeamList = function () {
        teamList.current.sort(function (a, b) {
            return decimalToNumber(a.rate) - decimalToNumber(b.rate);
        });
    };
    //检查数据是否已经设置好，设置好才能开启tip
    var dataVerify = function (ref) {
        var list = [A, B, D];
        var moneyRefs = [inputAmoneyRef, inputBmoneyRef, inputDmoneyRef];
        var count = 0;
        list.forEach(function (item, index) {
            if (moneyRefs[index] === ref) {
                //不管当前是不是0，如果另外两个是0.则当前为默认提示
                return;
            }
            if (new decimal_js_1["default"](item.money).toNumber() === 0) {
                count += 1;
            }
        });
        if (count >= 2) { //有两个以上都为0
            return false;
        }
        return true;
    };
    var defaultContent = "请下注";
    var getMaxContent = function () {
        var minDec = CashPrize(teamList.current[1]);
        if (minDec.toNumber() === 0) {
            return defaultContent;
        }
        var min = minDec.div(teamList.current[2].rate).toFixed(2, decimal_js_1["default"].ROUND_DOWN);
        return "\u5F53\u524D\u503C \u2265 " + min;
    };
    var getMidContent = function () {
        var maxDec = CashPrize(teamList.current[2]);
        var minDec = CashPrize(teamList.current[0]);
        var max = maxDec.div(teamList.current[1].rate).toFixed(2, decimal_js_1["default"].ROUND_DOWN);
        var min = minDec.div(teamList.current[1].rate).toFixed(2, decimal_js_1["default"].ROUND_DOWN);
        if (maxDec.toNumber() === 0 && minDec.toNumber() === 0) {
            return defaultContent;
        }
        else if (maxDec.toNumber() === 0) {
            return "\u5F53\u524D\u503C \u2265 " + min;
        }
        else if (minDec.toNumber() === 0) {
            return max + " \u2265 \u5F53\u524D\u503C";
        }
        else {
            return max + " \u2265 \u5F53\u524D\u503C \u2265 " + min;
        }
    };
    var getMinContent = function () {
        var maxDec = CashPrize(teamList.current[1]);
        if (maxDec.toNumber() === 0) {
            return defaultContent;
        }
        var max = maxDec.div(teamList.current[0].rate).toFixed(2, decimal_js_1["default"].ROUND_DOWN);
        return max + " \u2265 \u5F53\u524D\u503C";
    };
    var setTippyContent = function (ref) {
        if (!ref.current)
            return;
        resetTeamList(); //必须重新初始化数据
        sortTeamList(); //开始前，需要排序一下
        var ok = dataVerify(ref);
        var id = ref.current.dataset.id;
        teamList.current.forEach(function (team, index) {
            if (ref.current && String(team.id) === id) {
                var msg = "";
                switch (true) {
                    case new decimal_js_1["default"](team.rate).toNumber() === 0:
                        msg = "请先设置赔率";
                        break;
                    case !ok:
                        msg = defaultContent;
                        break;
                    case index === 0:
                        msg = getMinContent();
                        break;
                    case index === 1:
                        msg = getMidContent();
                        break;
                    case index === 2:
                        msg = getMaxContent();
                        break;
                    default:
                        msg = defaultContent;
                        break;
                }
                switch (id) {
                    case "1":
                        toDippy(tipA.current).setContent(msg);
                        break;
                    case "2":
                        toDippy(tipB.current).setContent(msg);
                        break;
                    case "3":
                        toDippy(tipD.current).setContent(msg);
                        break;
                }
            }
        });
    };
    var resetData = function () {
        localStorage.removeItem("teams");
        setA(NewTeam(1, "甲胜", "0.00", "1.000"));
        setB(NewTeam(2, "乙胜", "0.00", "1.000"));
        setD(NewTeam(3, "平局", "0.00", "1.000"));
        setProfitA("0.00");
        setProfitB("0.00");
        setProfitD("0.00");
    };
    var showTotalInput = function () {
        if (totalRef.current) {
            totalRef.current.value = totalMoney.toString();
            totalRef.current.style.display = "inline-block";
            setTimeout(function () {
                var _a;
                (_a = totalRef.current) === null || _a === void 0 ? void 0 : _a.focus();
            });
        }
    };
    var hideTotalInput = function () {
        if (totalRef.current) {
            totalRef.current.style.display = "none";
            var value = handleInputValue(totalRef);
            var pattern = /^(\+)?\d+\.$/;
            if (pattern.test(value)) {
                return;
            }
            setTotalMoney(new decimal_js_1["default"](value));
        }
    };
    var changeTotalInput = function () {
        if (totalRef.current) {
            var value = handleInputValue(totalRef);
            var pattern = /^(\+)?\d+\.$/;
            if (pattern.test(value)) {
                return;
            }
            setTotalMoney(new decimal_js_1["default"](value));
        }
    };
    var assignMoney = function () {
        var a_b = new decimal_js_1["default"](A.rate).div(new decimal_js_1["default"](B.rate));
        var a_d = new decimal_js_1["default"](A.rate).div(new decimal_js_1["default"](D.rate));
        var b_a = new decimal_js_1["default"](B.rate).div(new decimal_js_1["default"](A.rate));
        var b_d = new decimal_js_1["default"](B.rate).div(new decimal_js_1["default"](D.rate));
        var d_a = new decimal_js_1["default"](D.rate).div(new decimal_js_1["default"](A.rate));
        var d_b = new decimal_js_1["default"](D.rate).div(new decimal_js_1["default"](B.rate));
        var av = totalMoney.div(new decimal_js_1["default"](1).add(a_b).add(a_d));
        var bv = totalMoney.div(new decimal_js_1["default"](b_a).add(1).add(b_d));
        var dv = totalMoney.div(new decimal_js_1["default"](d_a).add(d_b).add(1));
        A.money = av;
        B.money = bv;
        D.money = dv;
        setA(A);
        setB(B);
        setD(D);
        calculate();
    };
    return (React.createElement("div", { className: "App background" },
        React.createElement("header", { className: "App-header" }, "\u5F69\u7968\u8D2D\u4E70\u65B9\u6848"),
        React.createElement("article", { className: 'App-body' },
            React.createElement("section", { className: 'content' },
                React.createElement("div", { className: 'base-rules' },
                    React.createElement("h3", null, "\u6838\u5FC3\u89C4\u5219"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "Aa \u2265 Bb \u2265 Cc"),
                        React.createElement("li", null, "Cc \u2265 Aa \u2265 Bb"),
                        React.createElement("li", null, "Bb \u2265 Cc \u2265 Aa")),
                    React.createElement("h3", null, "\u8D44\u91D1\u5206\u914D\u89C4\u5219"),
                    React.createElement("ul", null,
                        React.createElement("li", null, "A = M/(1 + a/b + a/c)"),
                        React.createElement("li", null, "B = M/(b/a + 1 + b/c)"),
                        React.createElement("li", null, "C = M/(c/a + c/b + 1)")),
                    React.createElement("div", { className: 'line' })),
                React.createElement("table", { className: 'App-body-table' },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: 'tnav' },
                            React.createElement("th", null, "\u7ADE\u731C"),
                            React.createElement("th", null, "\u8D54\u7387"),
                            React.createElement("th", null, "\u91D1\u989D"),
                            React.createElement("th", null, "\u5151\u5956"),
                            React.createElement("th", null, "\u6536\u76CA"),
                            React.createElement("th", null, "\u603B\u6536\u76CA"))),
                    React.createElement("tbody", null, renderTr()),
                    React.createElement("tfoot", null,
                        React.createElement("tr", { className: 'ttotal' },
                            React.createElement("td", null, "\u603B\u91D1\u989D"),
                            React.createElement("td", { colSpan: 5 },
                                React.createElement("div", { onClick: showTotalInput },
                                    totalMoney.toFixed(2, decimal_js_1["default"].ROUND_DOWN),
                                    React.createElement("input", { maxLength: 10, type: "text", ref: totalRef, onFocus: function () { formatInput(totalRef, totalMoney.toFixed(2, decimal_js_1["default"].ROUND_DOWN)); }, onChange: changeTotalInput, onBlur: hideTotalInput })))))),
                React.createElement("div", { className: 'tools' },
                    React.createElement("div", { className: 'tools-box' },
                        React.createElement("div", { className: 'tools-grid' },
                            React.createElement("div", { className: 'reset' },
                                React.createElement("button", { className: 'reset-btn', onClick: resetData }, "reset")),
                            React.createElement("div", { className: 'assign' },
                                React.createElement("button", { className: 'assign-btn', onClick: assignMoney }, "assign")))))),
            React.createElement("section", { className: 'content' },
                React.createElement("h3", null, "\u8BBE"),
                React.createElement("p", null,
                    "\u603B\u9884\u7B97\uFF1AM",
                    React.createElement("br", null),
                    "\u8BBE\u91D1\u989D\uFF1AA=",
                    A.name,
                    "\uFF0CB=",
                    B.name,
                    "\uFF0CC=",
                    D.name,
                    React.createElement("br", null),
                    " \u8BBE\u8D54\u7387\uFF1Aa=",
                    A.name,
                    "\uFF0Cb=",
                    B.name,
                    "\uFF0Cc=",
                    D.name),
                React.createElement("h3", null, "\u65B9\u7A0B\u5F0F"),
                React.createElement("p", null,
                    "\u5982\u679C",
                    A.name,
                    "\uFF1A",
                    React.createElement("br", null),
                    "\u2460 Aa - A - B - C \u2265 0",
                    React.createElement("br", null),
                    "\u00A0=>>\u00A0  A(a-1) \u2265 B + C",
                    React.createElement("br", null),
                    " \u5982\u679C",
                    B.name,
                    "\uFF1A",
                    React.createElement("br", null),
                    " \u2461 Bb - A - B - C \u2265 0",
                    React.createElement("br", null),
                    " \u00A0=>>\u00A0 B(b-1) \u2265 A + C",
                    React.createElement("br", null),
                    " \u5982\u679C",
                    D.name,
                    "\uFF1A",
                    React.createElement("br", null),
                    " \u2462 Cc - A - B - C \u2265 0",
                    React.createElement("br", null),
                    " \u00A0=>>\u00A0 C(c-1) \u2265 A + B",
                    React.createElement("br", null),
                    " \u603B\u9884\u7B97\uFF1A",
                    React.createElement("br", null),
                    " \u2463 A + B + C = M"),
                React.createElement("h3", null, "\u5316\u7B80"),
                React.createElement("p", null,
                    "\u5C06 \u2460 - \u2461 \u5F97\uFF1A \u2464 Aa \u2265 Bb",
                    React.createElement("br", null),
                    " =>> A \u2265 Bb/a",
                    React.createElement("br", null),
                    " =>>  Aa/b \u2265 B",
                    React.createElement("br", null),
                    " \u5C06 \u2461 - \u2462 \u5F97\uFF1A \u2465 Bb \u2265 Cc",
                    React.createElement("br", null),
                    " =>> B \u2265 Cc/b",
                    React.createElement("br", null),
                    " =>>  Bb/c \u2265 C",
                    React.createElement("br", null),
                    " \u5C06 \u2462 - \u2460 \u5F97\uFF1A \u2466 Cc \u2265 Aa",
                    React.createElement("br", null),
                    " =>> C \u2265 Aa/c",
                    React.createElement("br", null),
                    " =>>  Cc/a \u2265 A"),
                React.createElement("h3", null, "\u6700\u7EC8\u89E3"),
                React.createElement("p", null,
                    "\u5C06 \u2464 \u4E0E \u2465 \u7EC4\u5408\u5F97\uFF1A \u2467 Aa \u2265 Bb \u2265 Cc",
                    React.createElement("br", null),
                    " \u5C06 \u2464 \u4E0E \u2466 \u7EC4\u5408\u5F97\uFF1A \u2468 Cc \u2265 Aa \u2265 Bb",
                    React.createElement("br", null),
                    " \u5C06 \u2465 \u4E0E \u2466 \u7EC4\u5408\u5F97\uFF1A \u2469 Bb \u2265 Cc \u2265 Aa"),
                React.createElement("h3", null, "\u6C42\u5404\u6CE8\u7684\u91D1\u989D"),
                "A + Aa/b + Aa/c = M",
                React.createElement("br", null),
                " Bb/a + B + Bb/c = M",
                React.createElement("br", null),
                " Cc/a + Cc/b + C = M",
                React.createElement("h3", null, "\u8D44\u91D1\u5206\u914D\u65B9\u6848"),
                "A = M/(1 + a/b + a/c)",
                React.createElement("br", null),
                "B = M/(b/a + 1 + b/c)",
                React.createElement("br", null),
                "C = M/(c/a + c/b + 1)",
                React.createElement("br", null),
                React.createElement("br", null))),
        React.createElement("footer", { className: 'footer' },
            "\u6E29\u99A8\u63D0\u793A\uFF1A\u6210\u529F\u6CA1\u6709\u6377\u5F84 \uFF0C\u52AA\u529B\u9020\u5C31\u660E\u5929",
            React.createElement("br", null),
            "\u5F69\u7968\u53EA\u662F\u5A31\u4E50\uFF0C\u800C\u975E\u81F4\u5BCC\u6377\u5F84")));
}
//新建
function NewTeam(id, name, money, rate) {
    return {
        id: id,
        name: name,
        money: new decimal_js_1["default"](money),
        rate: new decimal_js_1["default"](rate)
    };
}
//兑奖
function CashPrize(item) {
    return new decimal_js_1["default"](item.money).mul(new decimal_js_1["default"](item.rate));
}
//收益
function SingleProfit(item) {
    return CashPrize(item).sub(new decimal_js_1["default"](item.money));
}
exports["default"] = App;
