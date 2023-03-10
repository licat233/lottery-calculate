<!--
 * @Author: licat
 * @Date: 2022-12-15 15:22:22
 * @LastEditors: licat
 * @LastEditTime: 2023-02-02 18:24:00
 * @Description: licat233@gmail.com
-->
# 彩票计算 - lottery calculate

## 设
设金额：
```
A=A胜，B=B胜，C=平局，M=总预算 
```
设赔率：
```
a=A胜，b=B胜，c=平局  
```

## 列方程式
如果A胜赢：
```
① Aa - A - B - C ≥ 0  =>>  A(a-1) ≥ B + C
```
如果B胜赢：
```
② Bb - A - B - C ≥ 0  =>>  B(b-1) ≥ A + C
```
如果平局：
```
③ Cc - A - B - C ≥ 0  =>>  C(c-1) ≥ A + B
```
总预算：
```
④ A + B + C = M
```

## 化简
将 ① - ② 得： 
```
⑤ Aa ≥ Bb =>> A ≥ Bb/a  =>>  Aa/b ≥ B
```
将 ② - ③ 得： 
```
⑥ Bb ≥ Cc =>> B ≥ Cc/b  =>>  Bb/c ≥ C
```
将 ③ - ① 得： 
```
⑦ Cc ≥ Aa =>> C ≥ Aa/c  =>>  Cc/a ≥ A
```

## 最终解
将 ⑤ 与 ⑥ 组合得：
```
⑧ Aa ≥ Bb ≥ Cc
```
将 ⑤ 与 ⑦ 组合得： 
```
⑨ Cc ≥ Aa ≥ Bb
```
将 ⑥ 与 ⑦ 组合得： 
```
⑩ Bb ≥ Cc ≥ Aa
```

## 求各注的金额
```
A + Aa/b + Aa/c = M

Bb/a + B + Bb/c = M 

Cc/a + Cc/b + C = M 
```

## 资金分配方案
```
A = M/(1 + a/b + a/c)

B = M/(b/a + 1 + b/c)

C = M/(c/a + c/b + 1)
```

## 同理，如果只分配2个
```
M = A + B

确保无论下注哪个，都不会亏本
Aa - A - B ≥ 0  =>> Aa - M ≥ 0 =>> Aa ≥ M  
Bb - B - A ≥ 0  =>> Bb - M ≥ 0 =>> Bb ≥ M  

得：
M ≥ A ≥ M/a  
M ≥ B ≥ M/b  

设：a ≥ b  
则 M/a ≤ M/b  
所以 A ≤ B  


结果:
M/a ≤ M/b ≤ A ≤ B  
M/a ≤ M/b ≤ B ≤ M  
```

## 结论：赔率相对较大的，其下注金额相对较小

## web
<https://licat233.github.io/lottery-calculate/index.html>
