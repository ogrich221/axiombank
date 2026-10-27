import { describe, it, expect } from 'vitest';
import { sampleUsers, filterUsers, emptyFilters, validateUser } from '@/lib/admin-demo';
describe('Sample administrator directory',()=>{
 it('searches by name, email and user ID',()=>{for(const query of ['Olivia','olivia.bennett@example.com','VR-001042']) expect(filterUsers(sampleUsers,{...emptyFilters,query}).map(u=>u.id)).toEqual(['VR-001042']);});
 it('applies status and role filters together',()=>{expect(filterUsers(sampleUsers,{...emptyFilters,status:'Active',role:'Support'}).map(u=>u.id)).toEqual(['VR-001048']);});
 it('includes joined-date boundaries',()=>{expect(filterUsers(sampleUsers,{...emptyFilters,from:'2026-10-25',to:'2026-10-26'}).length).toBe(2);});
 it('rejects a duplicate email without rejecting its own edit',()=>{const u=sampleUsers[0];expect(validateUser(u,sampleUsers)).toContain('already exists');expect(validateUser(u,sampleUsers,u.id)).toBe('');});
 it('requires names and valid emails',()=>{expect(validateUser({firstName:'',lastName:'B',email:'x@example.com'},[])).toContain('required');expect(validateUser({firstName:'A',lastName:'B',email:'invalid'},[])).toContain('valid email');});
 it('sorts newest and oldest before pagination',()=>{expect(filterUsers(sampleUsers,emptyFilters)[0].id).toBe('VR-001042');expect(filterUsers(sampleUsers,{...emptyFilters,sort:'oldest'})[0].id).toBe('VR-001065');});
});