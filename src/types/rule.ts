export interface RuleCondition {
    property: string // property to test on (e.g. "Name")
    pattern: string // regex to find matches of (e.g. "*(Wegman's|Publix|Safeway)*")
    flags?: string // regex flags (e.g. "i" for case insensitivity)
}

export interface BaseRule {
    conditions: RuleCondition[] // conditions which must hold to apply this rule
    type: 'filter' | 'override'
}

export interface FilterRule extends BaseRule {
    type: 'filter'
}

export interface OverrideRule extends BaseRule {
    type: 'override'
    property: string //  property to override
    findPattern: string // regex to find matches of (e.g. "*(Wegman's|Publix|Safeway)*")
    replacePattern: string // regex to replace any matches with (e.g. "Grocery Stores")
    flags: string // regex flags (e.g. "i" for case insensitivity)
}

export type Rule = FilterRule | OverrideRule
