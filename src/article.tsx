/*
 * @Author: licat
 * @Date: 2022-12-18 16:32:47
 * @LastEditors: licat
 * @LastEditTime: 2023-02-02 18:21:00
 * @Description: licat233@gmail.com
 */

type ArticleProps = {
    teams: Teams;
}

const Article: React.FC<ArticleProps> = (props) => {
    const { teams } = props
    return <>
        <h3>设</h3>
        <p>
            总预算：M
            <br />设金额：A={teams.A.name}，B={teams.B.name}，C={teams.C.name}
            <br /> 设赔率：a={teams.A.name}，b={teams.B.name}，c={teams.C.name}
        </p>

        <h3>方程式</h3>
        <p>
            如果{teams.A.name}：
            <br />① Aa - A - B - C &ge; 0<br />&nbsp;=&gt;&gt;&nbsp;  A(a-1) &ge; B + C
            <br /> 如果{teams.B.name}：
            <br /> ② Bb - A - B - C &ge; 0<br /> &nbsp;=&gt;&gt;&nbsp; B(b-1) &ge; A + C
            <br /> 如果{teams.C.name}：
            <br /> ③ Cc - A - B - C &ge; 0<br /> &nbsp;=&gt;&gt;&nbsp; C(c-1) &ge; A + B
            <br /> 总预算：
            <br /> ④ A + B + C = M
        </p>

        <h3>化简</h3>
        <p>
            将 ① - ② 得：
            ⑤ Aa &ge; Bb
            <br /> =&gt;&gt; A &ge; Bb/a
            <br /> =&gt;&gt;  Aa/b &ge; B
            <br /> 将 ② - ③ 得：
            ⑥ Bb &ge; Cc
            <br /> =&gt;&gt; B &ge; Cc/b
            <br /> =&gt;&gt;  Bb/c &ge; C
            <br /> 将 ③ - ① 得：
            ⑦ Cc &ge; Aa
            <br /> =&gt;&gt; C &ge; Aa/c
            <br /> =&gt;&gt;  Cc/a &ge; A
        </p>

        <h3>最终解</h3>
        <p>
            将 ⑤ 与 ⑥ 组合得：
            ⑧ Aa &ge; Bb &ge; Cc
            <br /> 将 ⑤ 与 ⑦ 组合得：
            ⑨ Cc &ge; Aa &ge; Bb
            <br /> 将 ⑥ 与 ⑦ 组合得：
            ⑩ Bb &ge; Cc &ge; Aa
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
            <br />M = A + B
            <br />
            <br />确保无论下注哪个，都不会亏本
            <br />Aa - M ≥ 0 =&gt;&gt; Aa ≥ M
            <br />Bb - M ≥ 0 =&gt;&gt; Bb ≥ M
            <br />
            <br />得：
            <br />M ≥ A ≥ M/a
            <br />M ≥ B ≥ M/b
            <br />
            <br />设 a ≥ b
            <br />则 M/a ≤ M/b
            <br />所以 A ≤ B
            <br />
            <br />结果:
            <br />M/a ≤ M/b ≤ A ≤ B 
            <br />M/a ≤ M/b ≤ B ≤ M
        </p>

        <h3>总结：赔率相对较大的，其下注金额相对较小</h3>

        <br />
        <br />
    </>
}

export default Article;