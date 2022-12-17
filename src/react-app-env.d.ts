/// <reference types="react-scripts" />
interface Team {
    [key: string]: string | number; //string类型的索引签名
    id: string
    index: number
    name: string
    money: number
    rate: number
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
