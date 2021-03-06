/* eslint-disable arrow-body-style */
import request from 'supertest';
import createLoopback from '~/test/utils/create-loopback';
{{#extended}}
import initialAccount from '~/server/initial-data/maintenance-account.json';
{{/extended}}

describe('boot process', () => {
  let server;

  beforeEach(() => {
    return createLoopback().then((s) => {
      server = s;
    });
  });

  afterEach((done) => {
    // Clear memory database
    server.dataSources.db.automigrate(done);
  });

  describe('root.js', () => {
    it('should return server status by root.js', (done) => {
      const conn = server.listen(8000, () => {
        request(server).get('/api').then((res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body).toHaveProperty('started');
          expect(res.body).toHaveProperty('uptime');
          conn.close(done);
        });
      });
    });
  });
  {{#extended}}
  describe('authentication.js', () => {
    it('should enable authentication by authentication.js', () => {
      expect(server.isAuthEnabled).toEqual(true);
    });
  });

  describe('email configuration', () => {
    it('should have Email model', () => {
      expect(server.models).toHaveProperty('Email');
    });

    it('Email model should send email', (done) => {
      server.models.Email.send({
        from: 'noreply@fakeserver.mailtrap.io',
        to: '92y0zm+7xhtk2ni75mas@grr.la',
        subject: 'Testing email',
        text: 'Testing email text',
        html: '<b>Testing email text</b>',
      }, done);
    }, 30000);
  });

  describe('create-admin.js', () => {
    it('should have Account model', () => {
      expect(server.models).toHaveProperty('Account');
    });

    it('should create a default admin user', () => {
      return server.models.Account.find().then((res) => {
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('createdAt');
        expect(res[0]).toHaveProperty('updatedAt');
        expect(res[0].id).toEqual(1);
        expect(res[0].email).toEqual(initialAccount.email);
        expect(res[0].password).toBeDefined();
      });
    });

    it('should create a default admin role', () => {
      return server.models.Role.find().then((res) => {
        expect(res).toHaveLength(1);
        expect(res[0]).toHaveProperty('created');
        expect(res[0]).toHaveProperty('modified');
        expect(res[0].id).toEqual(1);
        expect(res[0].name).toEqual('admin');
      });
    });

    it('should create RoleMapping entry for admin', () => {
      const RoleMapping = server.models.RoleMapping;
      return RoleMapping.find().then((res) => {
        expect(res).toHaveLength(1);
        expect(res[0].id).toEqual(1);
        expect(res[0].roleId).toEqual(1);
        expect(res[0].principalId).toEqual(1);
        expect(res[0].principalType).toEqual(RoleMapping.USER);
      });
    });
  });
  {{/extended}}
});
