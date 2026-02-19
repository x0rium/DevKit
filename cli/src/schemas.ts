// JSON Schemas for DevKit artifact validation
// Each schema validates YAML frontmatter of the corresponding artifact

export interface ArtifactSchema {
    id: string;
    file: string;           // expected filename
    directory: string;       // expected directory under .devkit/
    requiredSections: string[];  // required markdown ## sections
    optionalSections?: string[];
}

export const SCHEMAS: ArtifactSchema[] = [
    // ResearchKit
    {
        id: 'research.market',
        file: 'market.md',
        directory: 'research',
        requiredSections: ['Analogues', 'Unoccupied Space', 'Potential User'],
    },
    {
        id: 'research.feasibility',
        file: 'feasibility.md',
        directory: 'research',
        requiredSections: ['Known Approaches', 'Known Limitations', 'Verdict'],
    },
    {
        id: 'research.unknowns',
        file: 'unknowns.md',
        directory: 'research',
        requiredSections: [], // dynamic: each Unknown section has structured fields
    },
    {
        id: 'research.assumptions',
        file: 'assumptions.md',
        directory: 'research',
        requiredSections: [], // dynamic: each Assumption section has structured fields
    },

    // ProductKit
    {
        id: 'product.users',
        file: 'users.md',
        directory: 'product',
        requiredSections: ['Primary User'],
        optionalSections: ['Secondary User', 'Edge Cases'],
    },
    {
        id: 'product.ux_invariants',
        file: 'ux_invariants.md',
        directory: 'product',
        requiredSections: [], // dynamic: each U_N section has structured fields
    },
    {
        id: 'product.roadmap',
        file: 'roadmap.md',
        directory: 'product',
        requiredSections: ['MVP'],
        optionalSections: ['V1', 'Later', 'Never'],
    },

    // ArchKit
    {
        id: 'arch.invariants',
        file: 'invariants.md',
        directory: 'arch',
        requiredSections: [], // dynamic
    },
    {
        id: 'arch.impact',
        file: 'impact.md',
        directory: 'arch',
        requiredSections: [],
    },
    {
        id: 'arch.constitution',
        file: 'constitution.md',
        directory: 'arch',
        requiredSections: [],
    },

    // QAKit
    {
        id: 'qa.test_contracts',
        file: 'test_contracts.md',
        directory: 'qa',
        requiredSections: [],
    },
    {
        id: 'qa.coverage_map',
        file: 'coverage_map.md',
        directory: 'qa',
        requiredSections: [],
    },
    {
        id: 'qa.assumption_checks',
        file: 'assumption_checks.md',
        directory: 'qa',
        requiredSections: [],
    },
];

// Fields that should be present in structured sections (Unknown, Assumption, Invariant, etc.)
export const STRUCTURED_FIELDS: Record<string, string[]> = {
    'unknown': ['DESCRIPTION', 'RISK', 'VALIDATION', 'BLOCKER', 'STATUS'],
    'assumption': ['STATEMENT', 'BASIS', 'RISK', 'VALIDATION_METHOD', 'STATUS'],
    'invariant': ['STATEMENT', 'RATIONALE', 'VERIFICATION', 'FAILURE_MODE', 'STATUS'],
    'ux_invariant': ['STATEMENT', 'RATIONALE', 'VALIDATION', 'PRIORITY', 'STATUS'],
    'adr': ['CONTEXT', 'DECISION', 'CONSEQUENCES'],
    'rfc': ['TRIGGER', 'AFFECTED_INVARIANTS', 'OPTIONS', 'STATUS'],
    'investigation': ['TRIGGER', 'AFFECTED_ASSUMPTION', 'FINDING', 'OPTIONS', 'STATUS'],
    'test_contract': ['INVARIANT', 'WHAT', 'HOW', 'VIOLATION', 'CRITICALITY'],
};

export function getSchemaForFile(filename: string, directory: string): ArtifactSchema | undefined {
    return SCHEMAS.find(s => s.file === filename && s.directory === directory);
}
