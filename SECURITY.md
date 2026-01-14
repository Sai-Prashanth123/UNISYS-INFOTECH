# Security Features & Guidelines

## 🛡️ Implemented Security Features

### 1. Authentication & Authorization

#### JWT-Based Authentication
- Secure JWT token generation with configurable expiry
- Token verification on protected routes
- Role-based access control (RBAC) with admin, employer, and employee roles
- Automatic token expiration handling

#### Password Security
- Passwords hashed using bcrypt (10 rounds)
- Minimum password length: 6 characters
- Secure password reset flow with time-limited tokens
- Rate limiting on authentication endpoints

#### Supabase Auth Integration
- Dual authentication system (custom JWT + Supabase Auth)
- Secure password reset via email
- Email verification support

### 2. Rate Limiting

#### General Rate Limiting
- **100 requests per 15 minutes** per IP address
- Prevents DoS attacks and API abuse
- Configurable via environment variables

#### Authentication Rate Limiting
- **5 login attempts per 15 minutes** per IP address
- Prevents brute force attacks
- Separate limits for registration and login

#### Password Reset Rate Limiting
- **3 password reset requests per hour** per IP address
- Prevents email flooding and abuse
- IP-based tracking

### 3. Security Headers (Helmet)

Automatically applied to all responses:
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Enables browser XSS filter
- **Strict-Transport-Security**: Enforces HTTPS
- **Content-Security-Policy**: Restricts resource loading
- **X-Powered-By**: Header removed (hides Express)

### 4. Input Validation & Sanitization

#### Request Validation
- Express-validator for input validation
- Required field validation
- Email format validation
- Data type validation
- Length constraints

#### Data Sanitization
- **NoSQL Injection Protection**: Removes `$` and `.` from inputs
- **XSS Protection**: Strips script tags and event handlers
- **HTML Sanitization**: Cleans user-generated content
- Applied to body, query, and URL parameters

### 5. CORS (Cross-Origin Resource Sharing)

#### Development Mode
- Allows all origins for easy testing
- Credentials support enabled

#### Production Mode
- **Strict origin validation**
- Only allows configured `FRONTEND_URL`
- Blocks unauthorized cross-origin requests
- Specific allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Specific allowed headers: Content-Type, Authorization

### 6. HTTPS Enforcement

- Automatic HTTP to HTTPS redirect in production
- Uses X-Forwarded-Proto header (for proxy/load balancer compatibility)
- Ensures all traffic is encrypted

### 7. Error Handling

#### Development Mode
- Detailed error messages with stack traces
- Full error object returned
- Console logging for debugging

#### Production Mode
- Generic error messages to prevent information leakage
- Stack traces hidden from responses
- Errors logged to files only
- User-friendly error messages

### 8. Logging & Monitoring

#### Winston Logger
- Structured JSON logging
- Multiple log levels (error, warn, info, http, debug)
- Separate log files for errors and combined logs
- Daily log rotation (14 days retention)
- Automatic sensitive data redaction (passwords, tokens, etc.)

#### Request Logging
- All requests logged with:
  - HTTP method and path
  - Status code
  - Response time
  - IP address
  - User agent
- Failed requests (4xx, 5xx) highlighted

### 9. Environment Validation

Startup checks ensure:
- Required environment variables are set
- JWT_SECRET is sufficiently long (32+ characters)
- NODE_ENV is valid (development/production/test)
- Production-specific variables are set in production
- Warning for localhost URLs in production

### 10. Secure Password Generation

- Cryptographically secure random password generation
- Configurable length and character sets
- Used for temporary passwords
- No predictable patterns

---

## 🔒 Security Best Practices

### For Developers

#### 1. Environment Variables
```bash
# ✅ DO: Use environment variables for secrets
const jwtSecret = process.env.JWT_SECRET;

# ❌ DON'T: Hardcode secrets
const jwtSecret = 'my-secret-key-123';
```

#### 2. Password Handling
```javascript
// ✅ DO: Hash passwords before storing
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// ❌ DON'T: Store plain text passwords
const password = req.body.password;
await db.insert({ password });
```

#### 3. SQL Injection Prevention
```javascript
// ✅ DO: Use parameterized queries (Supabase handles this)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail);

// ❌ DON'T: String concatenation in queries
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

#### 4. XSS Prevention
```javascript
// ✅ DO: Sanitize user input (middleware handles this)
// Input: <script>alert('xss')</script>
// After sanitization: alert('xss')

// ❌ DON'T: Directly render user input without sanitization
res.send(`<div>${req.body.userInput}</div>`);
```

#### 5. Authentication Checks
```javascript
// ✅ DO: Use protect middleware on sensitive routes
router.get('/admin/users', protect, authorize('admin'), getUsers);

// ❌ DON'T: Forget authentication on sensitive endpoints
router.get('/admin/users', getUsers);
```

#### 6. Error Messages
```javascript
// ✅ DO: Generic error messages in production
res.status(401).json({ message: 'Invalid credentials' });

// ❌ DON'T: Leak information
res.status(401).json({ message: 'User admin@example.com not found' });
```

#### 7. Logging
```javascript
// ✅ DO: Use logger (auto-sanitizes sensitive data)
logger.info('User logged in', { email: user.email });

// ❌ DON'T: Log sensitive data with console.log
console.log('Login:', { email, password });
```

### For System Administrators

#### 1. Server Configuration
- Keep Node.js and npm updated
- Use a process manager (PM2) in production
- Configure firewall rules (only expose necessary ports)
- Enable automatic security updates
- Use separate databases for dev/staging/production

#### 2. SSL/TLS Configuration
- Use Let's Encrypt for free SSL certificates
- Enable HTTP/2
- Configure proper cipher suites
- Enable HSTS with long max-age

#### 3. Database Security
- Use strong passwords for database users
- Restrict database access by IP
- Enable SSL for database connections
- Regular backups with encryption
- Use Supabase Row Level Security (RLS)

#### 4. Monitoring
- Set up intrusion detection
- Monitor for unusual traffic patterns
- Alert on repeated failed login attempts
- Track rate limit violations
- Monitor error rates

---

## 🚨 Incident Response

### If Credentials Are Compromised

1. **Immediate Actions:**
   - Rotate all affected credentials immediately
   - Update `.env` files on all servers
   - Restart application to pick up new secrets
   - Invalidate all existing JWT tokens (users will need to re-login)

2. **Investigation:**
   - Check logs for suspicious activity
   - Identify affected systems/users
   - Determine scope of breach

3. **Notification:**
   - Notify affected users if personal data was accessed
   - Document the incident
   - Update security measures to prevent recurrence

### If Suspicious Activity Detected

1. **Verify the threat**
2. **Block the IP address** (temporarily)
3. **Review logs** for related activity
4. **Check for data exfiltration**
5. **Update security rules** if needed

---

## 🔍 Security Audit Checklist

Run this checklist quarterly:

### Application Security
- [ ] All dependencies updated (`npm audit fix`)
- [ ] No critical vulnerabilities in `npm audit`
- [ ] All secrets in environment variables
- [ ] Error messages don't leak sensitive info
- [ ] Logs don't contain passwords/tokens
- [ ] Rate limiting is effective
- [ ] CORS is properly configured
- [ ] HTTPS is enforced everywhere

### Authentication & Authorization
- [ ] JWT_SECRET is strong and unique
- [ ] Password policies are enforced
- [ ] Failed login attempts are limited
- [ ] Password reset flow is secure
- [ ] Session expiration is appropriate
- [ ] Role-based access control is working

### Infrastructure
- [ ] Server OS is updated
- [ ] Firewall rules are correct
- [ ] SSL certificates are valid
- [ ] Database backups are working
- [ ] Monitoring is active
- [ ] Intrusion detection is configured

### Code Review
- [ ] No hardcoded credentials
- [ ] Input validation on all endpoints
- [ ] Proper error handling
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Secure file uploads (if applicable)

---

## 📚 Security Resources

### Tools
- **npm audit**: Check for vulnerable dependencies
- **OWASP ZAP**: Web application security scanner
- **Snyk**: Continuous security monitoring
- **SSL Labs**: Test SSL/TLS configuration

### Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public GitHub issue
2. Email security issues privately
3. Provide detailed information about the vulnerability
4. Allow reasonable time for patching before disclosure

---

## 🎯 Security Roadmap

### Implemented ✅
- JWT authentication
- Rate limiting
- Input validation & sanitization
- Security headers (Helmet)
- HTTPS enforcement
- Secure logging
- Environment validation
- Graceful shutdown
- Password strength requirements

### Recommended Enhancements 🚀
- [ ] Two-factor authentication (2FA)
- [ ] API versioning
- [ ] Request signing for critical operations
- [ ] Audit trail for admin actions
- [ ] Automated security scanning in CI/CD
- [ ] Web Application Firewall (WAF)
- [ ] DDoS protection (Cloudflare)
- [ ] Penetration testing
- [ ] Security training for developers

---

**Security is an ongoing process, not a one-time implementation!**

Review and update security measures regularly. Stay informed about new vulnerabilities and best practices.
