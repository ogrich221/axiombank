import { describe, expect, it } from 'vitest';
import { profileSchema, registrationSchema, residenceCountries, transferPreviewSchema } from '@/lib/customer-schemas';
const profile = { first_name:'Jordan', middle_name:'',last_name:'Lee',display_name:'Jordan',date_of_birth:'1990-05-15',nationality:'American',country:'United States',address:'100 Test Street',city:'Boston',region:'MA',postal_code:'02110',phone:'+1 202 555 0100' };
describe('Customer rules',()=>{
  it('keeps exactly 54 distinct eligible residences',()=>{expect(residenceCountries.length).toBe(54);expect(new Set(residenceCountries).size).toBe(54);});
  it('rejects African residences for this product',()=>{for(const country of ['Nigeria','South Africa','Egypt','Kenya','Morocco'])expect(profileSchema.safeParse({...profile,country}).success).toBe(false);});
  it('requires matching passwords',()=>{expect(registrationSchema.safeParse({...profile,email:'jordan@example.com',password:'a secure passphrase',confirm_password:'a different passphrase',terms:true}).success).toBe(false);});
  it('does not accept application submission without consent',()=>{expect(registrationSchema.safeParse({...profile,email:'jordan@example.com',password:'a secure passphrase',confirm_password:'a secure passphrase',terms:false}).success).toBe(false);});
  it('validates valid registration details',()=>{expect(registrationSchema.safeParse({...profile,email:'jordan@example.com',password:'a secure passphrase',confirm_password:'a secure passphrase',terms:true}).success).toBe(true);});
  it('rejects invalid transfer amounts',()=>{expect(transferPreviewSchema.safeParse({recipient:'Jordan Lee',bank:'Test Bank',account:'12345678',amount:-50,reference:''}).success).toBe(false);});
});