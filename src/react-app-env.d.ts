/*
 * @Author: licat
 * @Date: 2022-12-15 15:22:35
 * @LastEditors: licat
 * @LastEditTime: 2023-02-02 15:06:29
 * @Description: licat233@gmail.com
 */
/// <reference types="react-scripts" />
interface Team {
    [key: string]: string | number | boolean; //string类型的索引签名
    id: string
    index: number
    name: string
    money: number
    rate: number
    status: boolean
}

interface Teams {
    [key: string]: Team; //string类型的索引签名
    A: Team;
    B: Team;
    C: Team;
}

interface CacheData {
    [key: string]: CacheTeams | number; //string类型的索引签名
    teams: Teams
    total: number;
}
