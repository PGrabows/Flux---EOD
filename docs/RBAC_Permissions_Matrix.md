# RBAC Permissions Matrix

## Role Hierarchy & Descriptions

The roles reflect a typical Polish corporate document approval chain:

| Role | Description |
|---|---|
| **SysAdmin** | Full system administration: users, roles, integrations, audit logs, system settings |
| **DocManager** | Document operations manager: manages document types, statuses, workflows, OCR, and notifications |
| **Finance** | Finance department — can create, review, and process financial documents; limited approval scope |
| **Controlling** | Controlling department — reviews and validates financial data; can approve within their scope |
| **FinDirector** | Finance Director — final financial approver; broad visibility across finance and controlling documents |
| **HoD** | Head of Department — departmental approver; manages and approves documents within their department |
| **HR** | HR department — near-full access to the ERP section: view and manage all employee requests across teams, override coordinator decisions, view all work hours, manage ERP settings |
| **Team Coordinator** | Team-level coordinator — processes and approves leave/illness requests for team members, tracks work hours within team scope |
| **Author** | Document creator — can create, upload, and edit their own documents; submit for approval |
| **Viewer** | Read-only access to documents they are authorized to see |

**Approval chain (EOD documents):** Author → HoD → Finance/Controlling → FinDirector  
**Approval chain (ERP requests):** Employee → Team Coordinator → HR (escalation/override)

---

## Permissions Matrix

**Legend:** `✓` = granted, `—` = not granted, `⊘` = granted with ownership/department restriction (own resources only)

### Document Management

| Permission | SysAdmin | DocManager | Finance | Controlling | FinDirector | HoD | HR | Team Coordinator | Author | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View documents | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ⊘ | ⊘ | ⊘ |
| Upload documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ✓ | — |
| Edit document metadata | ✓ | ✓ | ⊘ | ⊘ | ⊘ | ⊘ | ⊘ | — | ⊘ | — |
| Delete documents | ✓ | ✓ | — | — | — | — | — | — | — | — |
| Download documents | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ⊘ | ⊘ | ⊘ |
| Preview documents | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ⊘ | ⊘ | ⊘ |
| Manage document types | ✓ | ✓ | — | — | — | — | — | — | — | — |
| Manage document statuses | ✓ | ✓ | — | — | — | — | — | — | — | — |

**Notes:**
- Finance, Controlling, and FinDirector can view **all** documents (cross-department visibility for financial oversight).
- HoD can view documents within their department only (`⊘`).
- HR can view and upload ERP-related documents across teams (`⊘`), but cannot delete documents.
- Team Coordinator can view and upload ERP-related documents within their team scope (`⊘`).
- Author and Viewer have ownership-based restrictions (`⊘`).

### Workflow & Approvals

| Permission | SysAdmin | DocManager | Finance | Controlling | FinDirector | HoD | HR | Team Coordinator | Author | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Submit document for approval | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ✓ | — |
| Approve documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | — | — |
| Reject documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | — | — |
| View workflow history | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ⊘ | ⊘ | — |
| Configure workflow steps | ✓ | ✓ | — | — | — | — | — | — | — | — |
| Reassign approval tasks | ✓ | ✓ | — | — | ✓ | — | — | — | — | — |

**Notes:**
- Finance, Controlling, FinDirector, and HoD are all approvers within their respective scopes.
- FinDirector can reassign approval tasks (escalation authority).
- DocManager can approve as a fallback/operational role.
- HR can approve/reject ERP-related documents across all teams (`⊘`).
- Team Coordinator can approve/reject ERP-related documents within their team scope (`⊘`).

### User & Role Administration

| Permission | SysAdmin | DocManager | Finance | Controlling | FinDirector | HoD | HR | Team Coordinator | Author | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View users | ✓ | — | — | — | — | — | — | — | — | — |
| Create users | ✓ | — | — | — | — | — | — | — | — | — |
| Edit users | ✓ | — | — | — | — | — | — | — | — | — |
| Delete / deactivate users | ✓ | — | — | — | — | — | — | — | — | — |
| Assign roles to users | ✓ | — | — | — | — | — | — | — | — | — |
| Manage roles | ✓ | — | — | — | — | — | — | — | — | — |
| Manage permissions | ✓ | — | — | — | — | — | — | — | — | — |
| Edit own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notes:**
- Only SysAdmin has user/role administration — no delegation to business roles.
- HR and Team Coordinator have no access to user/role administration; they can only edit their own profiles.

### OCR & Background Jobs

| Permission | SysAdmin | DocManager | Finance | Controlling | FinDirector | HoD | HR | Team Coordinator | Author | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View OCR job status | ✓ | ✓ | — | — | — | — | — | — | ⊘ | — |
| Retry failed OCR jobs | ✓ | ✓ | — | — | — | — | — | — | — | — |
| Cancel OCR jobs | ✓ | ✓ | — | — | — | — | — | — | — | — |
| Configure OCR settings | ✓ | — | — | — | — | — | — | — | — | — |

**Notes:**
- OCR management is restricted to SysAdmin and DocManager.
- HR and Team Coordinator have no access to OCR features (ERP-focused roles).
- Authors can only see the OCR status of their own documents.

### Integrations (LDAPS, external directories)

| Permission | SysAdmin | DocManager | Finance | Controlling | FinDirector | HoD | HR | Team Coordinator | Author | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View integration config | ✓ | — | — | — | — | — | — | — | — | — |
| Configure integrations | ✓ | — | — | — | — | — | — | — | — | — |
| Trigger directory sync | ✓ | — | — | — | — | — | — | — | — | — |

**Notes:**
- Integration access is exclusively for SysAdmin.
- HR and Team Coordinator have no access to integration features.

### Audit & System

| Permission | SysAdmin | DocManager | Finance | Controlling | FinDirector | HoD | HR | Team Coordinator | Author | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View audit logs | ✓ | ✓ | — | — | ✓ | — | — | — | — | — |
| Export audit logs | ✓ | — | — | — | — | — | — | — | — | — |
| View dashboard statistics | ✓ | ✓ | ✓ | ✓ | ✓ | ⊘ | ⊘ | ⊘ | ⊘ | — |
| Manage system settings | ✓ | — | — | — | — | — | — | — | — | — |
| Manage notifications | ✓ | ✓ | — | — | — | — | — | — | — | — |

**Notes:**
- FinDirector can view audit logs for compliance/oversight purposes.
- Only SysAdmin can export audit logs and manage system settings.
- HR sees all ERP dashboard statistics across teams (`⊘`); Team Coordinator sees team-level ERP statistics only (`⊘`).
- Dashboard statistics are visible to all business roles, with HoD/HR/Team Coordinator/Author restricted to their scope.

---

## ERP (Employee Requests & Work Hours)

New permission category for the ERP (HR/employee self-service) section of the application.

| Permission | HR | Team Coordinator |
|---|:---:|:---:|
| View leave requests | ✓ | ⊘ |
| Approve leave requests | ✓ | ⊘ |
| Reject leave requests | ✓ | ⊘ |
| View illness requests | ✓ | ⊘ |
| Approve illness requests | ✓ | ⊘ |
| Reject illness requests | ✓ | ⊘ |
| View work hours | ✓ | ⊘ |
| Edit work hours | ✓ | ⊘ |
| Approve work hour corrections | ✓ | ⊘ |
| Escalate requests | ✓ | — |
| View ERP dashboard | ✓ | ⊘ |
| Manage ERP settings | ✓ | — |

**Notes:**
- HR has full ERP access across all teams (✓ on all permissions).
- Team Coordinator has team-scoped access (`⊘`) for viewing, approving, and rejecting requests and work hours.
- Team Coordinator cannot escalate requests or manage ERP settings (—).
- ERP section is isolated from EOD document management — HR and Team Coordinator permissions do not grant access to EOD document operations beyond viewing/uploading ERP-related documents.

---

## Recommended Permission Keys

Following the Prisma entity names from the architecture spec:

```
documents:view
documents:upload
documents:edit
documents:delete
documents:download
documents:preview
document-types:manage
document-statuses:manage

workflow:submit
workflow:approve
workflow:reject
workflow:history:view
workflow:steps:configure
workflow:tasks:reassign

users:view
users:create
users:edit
users:delete
roles:assign
roles:manage
permissions:manage
profile:edit

ocr:status:view
ocr:retry
ocr:cancel
ocr:settings:manage

integrations:view
integrations:configure
integrations:sync

audit:view
audit:export
dashboard:view
settings:manage
notifications:manage

erp:leave:view
erp:leave:approve
erp:leave:reject
erp:illness:view
erp:illness:approve
erp:illness:reject
erp:work-hours:view
erp:work-hours:edit
erp:work-hours:approve
erp:requests:escalate
erp:dashboard:view
erp:settings:manage
```

---

## Key Design Decisions

1. **DocManager** retains document operations (types, statuses, workflow config, OCR management) but has no user administration, which stays exclusively with SysAdmin.

2. **Finance and Controlling are peer roles** — both have full document visibility and approval rights within their domain. They can view all documents (cross-department), reflecting financial oversight requirements. Neither can manage document types, workflows, or system settings.

3. **FinDirector is the top financial approver** — has broad visibility (all documents, audit logs), can reassign approval tasks, and can approve/reject at the highest level. Cannot manage system infrastructure or user accounts.

4. **HoD is a departmental approver** — scoped to their department (`⊘`). Can approve/reject documents submitted by their team members, view departmental workflow history, and see departmental dashboard statistics.

5. **Author and Viewer** — Author creates and submits documents; Viewer has read-only access. Both are ownership-restricted (`⊘`).

6. **SysAdmin remains the sole administrator** — no delegation of user/role management or integration configuration to business roles.

7. **Approval chain enforcement** — The backend workflow module must enforce the approval chain (Author → HoD → Finance/Controlling → FinDirector) regardless of role permissions. Permissions grant the ability to approve; workflow configuration determines who approves what and in what order.

8. **HR vs Team Coordinator relationship** — HR is above Team Coordinator in the ERP hierarchy. HR can override coordinator decisions, escalate requests, and manage ERP settings. Team Coordinator processes requests within their team scope only. Escalation path: Employee → Team Coordinator → HR.

9. **Team scoping for Team Coordinator** — All Team Coordinator ERP permissions are team-scoped (`⊘`). The backend must enforce team/department membership checks for every ERP operation by a coordinator.

10. **ERP section isolation** — The ERP section (leave requests, illness requests, work hours) is separate from EOD document management. HR and Team Coordinator roles are ERP-focused and do not grant access to EOD document operations, OCR, integrations, or audit logs.

---

## RBAC Implementation Notes

- **Role ↔ Permission many-to-many** via `RolePermission` entity; **User ↔ Role many-to-many** via `UserRole` entity. A user holding multiple roles gets the union of all assigned permissions.
- **Ownership-based restrictions (`⊘`)** require resource-level checks beyond RBAC. The backend guards must filter by document ownership, department membership, or explicit sharing.
- **Department scoping** for HoD requires a `Department` entity linked to `User` and `Document`. The backend must enforce department-level filtering for HoD's `⊘` permissions.
- **Team/department scoping for Team Coordinator** requires a `Team` or `Department` entity linked to `User` and ERP entities (leave requests, illness requests, work hours). The backend must enforce team-level filtering for all Team Coordinator ERP permissions.
- **All authorization decisions enforced on the backend** per `.AGENTS.md` line 38. Frontend route guards are UX-only.
- **LDAPS integration**: When external directory sync is enabled (Phase 6), role assignment may be driven by group membership from Active Directory. The `IntegrationConfiguration` entity should support mapping AD groups to Fluxis roles.
