/// <reference types="react-scripts" />
interface Team {
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
    name: string
    money: string
    rate: string
}

interface CacheTeams {
    A: CacheTeam,
    B: CacheTeam,
    D: CacheTeam
}