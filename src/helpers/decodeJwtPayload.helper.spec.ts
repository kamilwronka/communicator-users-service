import { decodeJwtPayload } from './decodeJwtPayload.helper';
import { formatUserId } from './formatUserId.helper';

const sampleJwt =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkxqdGtUek5yUDM5UmNHUWJsb0Q0OSJ9.eyJpc3MiOiJodHRwczovL2NvbW11bmljYXRvci1kZXYuZXUuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDYzNWMwMmNmNjkxYWMyOGRhMWFlYTY2OSIsImF1ZCI6WyJodHRwczovL2NvbW11bmljYXRvci1kZXYuZXUuYXV0aDAuY29tL2FwaS92Mi8iLCJodHRwczovL2NvbW11bmljYXRvci1kZXYuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY2Njk4MDA4OSwiZXhwIjoxNjY3MDY2NDg5LCJhenAiOiJlNmlRaURiZ0ZjaWNjZWIwbXNoVW9vMU1KZFBDZVJTeiIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDpjdXJyZW50X3VzZXIgdXBkYXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSJ9.AsJXAVuTx9HaK1m_BWc2EmUUl9lFZEH743WZxLeOuogviJBKffIPdr7LZqHwMdfJkKmmVHOpnP_1ClHivPEJjbq0iCz2rsJjsLVE6UNxH1IxJndd8TCYdZ5sMtHxHtl_oQYfama7pNpcwfnSqcwyOY855ql2OqZBXgEXf3bTgVjcIMtyTLSD5IxK-6fY4HWjjaMPjgxM_wT5ucdRAJfOZAEzqsikwFDqSPkqgl8zeFLARCTWmPEMBDEA4XKqvfBaw-qpIxAqartkvBWssFFN2bSQ17qZJIBfQCNkadeSSls3jENW68nhBkHpNJvBkhBpf5GmerGfgZJwuamt8CEGBg';

const sampleJwtPayload = {
  iss: 'https://communicator-dev.eu.auth0.com/',
  sub: 'auth0|635c02cf691ac28da1aea669',
  aud: [
    'https://communicator-dev.eu.auth0.com/api/v2/',
    'https://communicator-dev.eu.auth0.com/userinfo',
  ],
  iat: 1666980089,
  exp: 1667066489,
  azp: 'e6iQiDbgFcicceb0mshUoo1MJdPCeRSz',
  scope: 'openid profile email read:current_user update:current_user_metadata',
};

describe('helpers', () => {
  describe('decodeJwtPayload', () => {
    it('should return correct jwt payload', () => {
      const result = decodeJwtPayload(sampleJwt);

      expect(result).toEqual(sampleJwtPayload);
    });
  });
});
