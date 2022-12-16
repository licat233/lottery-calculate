/// <reference types="react-scripts" />
interface Team {
    id: number
    name: string
    money: Decimal
    rate: Decimal
}

interface Teams {
    A: Team,
    B: Team,
    D: Team
}

interface CacheTeam {
    id: number
    name: string
    money: string
    rate: string
}

interface CacheTeams {
    A: CacheTeam,
    B: CacheTeam,
    D: CacheTeam
}