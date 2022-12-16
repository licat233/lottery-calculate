# 彩票计算 - lottery calculate

## 计算过程
设金额：
```
A=A胜，B=B胜，C=平局  
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

## 化简
将 ① - ② 得： 
```
④ Aa ≥ Bb
```
将 ② - ③ 得： 
```
⑤ Bb ≥ Cc
```
将 ③ - ① 得： 
```
⑥ Cc ≥ Aa
```

## 最终解
将 ④ 与 ⑤ 组合得：
```
 ⑦ Aa ≥ Bb ≥ Cc
```
将 ④ 与 ⑥ 组合得： 
```
⑧ Cc ≥ Aa ≥ Bb
```
将 ⑤ 与 ⑥ 组合得： 
```
⑨ Bb ≥ Cc ≥ Aa
```

## view
<https://licat233.github.io/lottery-calculate/index.html>
