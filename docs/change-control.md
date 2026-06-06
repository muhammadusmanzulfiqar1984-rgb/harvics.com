# Change Control Process

**Purpose**  
Ensure that any modification to the project (code, assets, configuration, or structure) is performed safely, reviewed, and auditable.

## Steps

1. **Create a Change Request**  
   - Open an issue in the repository with the title `Change Request: <short description>`.  
   - Fill the template:
     - **Description** – What is being changed and why.  
     - **Impact Analysis** – Potential effects on UI, API, CI, or assets.  
     - **Rollback Plan** – How to revert if the change causes issues.  
     - **Testing Plan** – Unit, integration, and manual tests required.

2. **Branch Off**  
   - Create a branch from `main` named `cr/<issue-number>-<short-name>`.

3. **Implement Changes**  
   - Make code or asset modifications.  
   - Run `npm test` and `npm run lint` locally.  
   - If new assets are added, ensure they are placed under the appropriate `public/assets/...` folder.

4. **Automated Checks**  
   - Push the branch; CI will run lint, tests, and the asset‑structure check script.  
   - CI must pass before proceeding.

5. **Peer Review**  
   - Request at least **two** approvals from team members.  
   - Reviewers must verify:
     - Correctness of code changes.  
     - No accidental deletion of assets.  
     - Documentation updates (if needed).

6. **Merge**  
   - After approvals and successful CI, merge the PR into `main`.  
   - The merge triggers the backup script (via a separate workflow or manual run) to snapshot the current assets.

7. **Post‑Merge Verification**  
   - Run the health‑check endpoint (`/api/health`) to confirm asset counts are as expected.  
   - Monitor alerts for any failures.

## Emergency Changes

- If a critical issue arises, create a **hotfix** branch (`hotfix/<description>`).  
- Bypass the full review but still run CI.  
- Document the reason and merge as soon as possible.

---

*This process is designed to be risk‑free and maintain project stability while allowing future enhancements.*