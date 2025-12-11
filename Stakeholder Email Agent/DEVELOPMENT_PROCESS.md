# Development Process

## Core Principle

**Architecture-First Development**: Before implementing any feature or change, always review and update the architecture and project plan documents to ensure consistency and clarity.

## Standard Development Workflow

### 1. Review Phase (REQUIRED FIRST STEP)
Before making any code changes:

1. **Read ARCHITECTURE.md** - Understand current system design
2. **Read DEVELOPMENT_ROADMAP.md** - Check current phase and dependencies
3. **Read todo.md** - Review pending tasks and priorities
4. **Read CONTEXT_MANAGEMENT.md** (if applicable) - Understand context flow

### 2. Planning Phase
After understanding current state:

1. **Update ARCHITECTURE.md** - Document proposed changes
2. **Update DEVELOPMENT_ROADMAP.md** - Add new phases if needed
3. **Update todo.md** - Add specific implementation tasks
4. **Create design documents** - For complex features (like CONTEXT_MANAGEMENT.md)

### 3. Implementation Phase
Only after documentation is updated:

1. **Implement changes** - Follow the documented architecture
2. **Mark tasks complete** - Update todo.md as you progress
3. **Write tests** - Ensure changes work as documented
4. **Update inline comments** - Keep code documentation current

### 4. Validation Phase
Before delivering to user:

1. **Review architecture docs** - Ensure they match implementation
2. **Test end-to-end** - Verify complete workflow
3. **Update COMPREHENSIVE_GUIDE.md** - Consolidate all documentation
4. **Create checkpoint** - Save stable state

## Why This Matters

### For AI Agents
- **Context window management**: Architecture docs provide essential context without re-reading all code
- **Consistency**: Prevents divergence between design and implementation
- **Debugging**: Clear architecture makes issues easier to identify

### For Human Developers
- **Onboarding**: New developers understand system quickly
- **Maintenance**: Changes are easier when architecture is clear
- **Collaboration**: Team members stay aligned

### For Users
- **Transparency**: Can understand how the system works
- **Confidence**: Well-documented systems are more trustworthy
- **Debugging**: Can help diagnose issues with clear architecture

## Document Hierarchy

```
COMPREHENSIVE_GUIDE.md (User-facing, complete reference)
├── ARCHITECTURE.md (Technical design)
├── DEVELOPMENT_ROADMAP.md (Implementation plan)
├── CONTEXT_MANAGEMENT.md (Feature-specific design)
├── EMAIL_STYLE_SYSTEM.md (Feature-specific design)
├── TESTING_GUIDE.md (Quality assurance)
└── TEST_CATALOG.md (Test inventory)
```

## Key Documents

### ARCHITECTURE.md
- **Purpose**: Technical design reference
- **Audience**: Developers and AI agents
- **Update when**: Adding features, changing data flow, modifying agents
- **Contains**: System overview, agent specifications, data structures, API contracts

### DEVELOPMENT_ROADMAP.md
- **Purpose**: Implementation plan and progress tracking
- **Audience**: Project managers and developers
- **Update when**: Starting new phases, completing milestones
- **Contains**: Phases, tasks, dependencies, success criteria

### todo.md
- **Purpose**: Granular task tracking
- **Audience**: Developers
- **Update when**: Every code change
- **Contains**: Checkbox lists of pending and completed tasks

### COMPREHENSIVE_GUIDE.md
- **Purpose**: Complete user and developer reference
- **Audience**: All stakeholders
- **Update when**: Major features complete
- **Contains**: Consolidated information from all other docs

## Anti-Patterns to Avoid

❌ **Code-first development**: Writing code before updating architecture docs
❌ **Stale documentation**: Docs that don't match implementation
❌ **Scattered information**: Important details only in code comments
❌ **Missing design docs**: Complex features without architectural documentation
❌ **Skipping reviews**: Not reading architecture docs before changes

## Best Practices

✅ **Document-driven**: Architecture docs guide implementation
✅ **Living documentation**: Docs updated with every significant change
✅ **Single source of truth**: Architecture docs are authoritative
✅ **Feature design docs**: Complex features get dedicated design documents
✅ **Regular reviews**: Check docs match reality periodically

## Example: Adding a New Feature

### Bad Approach ❌
```
1. Start coding the feature
2. Realize it conflicts with existing design
3. Refactor multiple files
4. Update docs as afterthought (maybe)
5. Docs don't match implementation
```

### Good Approach ✅
```
1. Read ARCHITECTURE.md and DEVELOPMENT_ROADMAP.md
2. Create feature design doc (e.g., CONTEXT_MANAGEMENT.md)
3. Update ARCHITECTURE.md with integration points
4. Update DEVELOPMENT_ROADMAP.md with implementation phases
5. Add tasks to todo.md
6. Implement following the documented design
7. Mark tasks complete in todo.md
8. Update COMPREHENSIVE_GUIDE.md
9. Create checkpoint
```

## Checkpoint Strategy

**When to create checkpoints:**
- After completing a major feature
- Before risky refactoring
- When all tests pass
- After updating all documentation

**What to include:**
- All code changes
- Updated documentation
- Test results
- Migration scripts (if applicable)

## Context Management for AI Agents

**Problem**: AI agents have limited context windows and can lose track of system architecture across multiple iterations.

**Solution**: Architecture-first development ensures agents can:
1. Quickly reload context by reading architecture docs
2. Understand system design without re-reading all code
3. Make consistent changes that align with overall design
4. Identify integration points and dependencies

**Key Practice**: Start every development session by reading:
- ARCHITECTURE.md (system design)
- DEVELOPMENT_ROADMAP.md (current phase)
- todo.md (immediate tasks)

This provides essential context in ~5,000 tokens instead of reading 50,000+ tokens of code.

## Conclusion

Architecture-first development is not overhead—it's **essential infrastructure** for building complex systems with AI agents and human developers. The time invested in documentation pays dividends in consistency, maintainability, and development velocity.

**Remember**: If it's not in the architecture docs, it doesn't exist in the system design.
