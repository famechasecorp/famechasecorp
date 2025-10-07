# MilesWeb Hosting & Razorpay Integration Setup Guide

## 🚀 Complete Deployment Setup for FameChase.com

### 📋 Prerequisites Checklist

- [ ] MilesWeb hosting account
- [ ] Custom domain purchased
- [ ] Razorpay business account
- [ ] SSL certificate ready
- [ ] cPanel access

---

## 🌐 STEP 1: MilesWeb Hosting Setup

### 1.1 cPanel Configuration

```bash
# Login to your MilesWeb cPanel
# Navigate to: https://your-domain.com:2083/
```

### 1.2 Domain Setup

1. Go to **Domains > Subdomains**
2. Add your custom domain
3. Point to `/public_html` directory

### 1.3 SSL Certificate Setup

```bash
# In cPanel > SSL/TLS
1. Select "Let's Encrypt SSL"
2. Enable "Force HTTPS Redirect"
3. Verify certificate installation
```

---

## 📁 STEP 2: File Upload Process

### 2.1 Build Production Files

```bash
cd client
npm run build
```

### 2.2 Upload Files to MilesWeb

```bash
# Method 1: cPanel File Manager
1. Login to cPanel
2. Open File Manager
3. Navigate to public_html
4. Upload dist/spa/* contents
5. Extract if needed

# Method 2: FTP Upload
Host: ftp.your-domain.com
Username: your-cpanel-username
Password: your-cpanel-password
Port: 21

# Upload contents of dist/spa/ to public_html/
```

### 2.3 Server Configuration

Create `.htaccess` in public_html:

```apache
# public_html/.htaccess
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache static files
<filesMatch "\\.(ico|pdf|flv|jpg|jpeg|png|gif|js|css|swf)$">
Header set Cache-Control "max-age=84600, public"
</filesMatch>

# Compress files
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

---

## 💳 STEP 3: Razorpay Integration

### 3.1 Razorpay Account Setup

1. Visit: https://dashboard.razorpay.com/
2. Complete business verification
3. Get API credentials:
   - Key ID
   - Key Secret

### 3.2 Payment Gateway Integration

Create payment integration file:

```javascript
// client/lib/razorpay.ts
export interface RazorpayConfig {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const processPayment = async (config: RazorpayConfig) => {
  const res = await initializeRazorpay();

  if (!res) {
    alert('Payment failed to load. Please try again.');
    return;
  }

  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID || config.key,
    amount: config.amount * 100, // Convert to paise
    currency: config.currency,
    name: config.name,
    description: config.description,
    order_id: config.order_id,
    handler: config.handler,
    prefill: config.prefill,
    theme: config.theme,
    modal: {
      ondismiss: () => {
        console.log('Payment dismissed');
      }
    }
  };

  const paymentObject = new (window as any).Razorpay(options);
  paymentObject.open();
};
```

### 3.3 Environment Variables Setup

Create `.env` file in public_html:

```bash
# .env
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
REACT_APP_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
REACT_APP_DOMAIN=https://your-domain.com
```

### 3.4 Backend Payment Verification (Optional)

If you want server-side verification:

```php
<?php
// public_html/api/verify-payment.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $razorpay_order_id = $input['razorpay_order_id'];
    $razorpay_payment_id = $input['razorpay_payment_id'];
    $razorpay_signature = $input['razorpay_signature'];

    $key_secret = 'your_razorpay_key_secret';

    $generated_signature = hash_hmac('sha256',
        $razorpay_order_id . "|" . $razorpay_payment_id,
        $key_secret
    );

    if ($generated_signature === $razorpay_signature) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'failure']);
    }
}
?>
```

---

## 🔧 STEP 4: Database Setup (Optional)

### 4.1 MySQL Database Creation

```sql
-- In cPanel > MySQL Databases
CREATE DATABASE famechase_db;

-- Create tables for user data and purchases
CREATE TABLE purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    product_id VARCHAR(50),
    amount DECIMAL(10,2),
    razorpay_payment_id VARCHAR(255),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_data JSON,
    analysis_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 PHP Database Connection

```php
<?php
// public_html/config/database.php
$host = 'localhost';
$dbname = 'your_database_name';
$username = 'your_db_username';
$password = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
```

---

## 📧 STEP 5: Email Integration

### 5.1 SMTP Configuration

```php
<?php
// public_html/api/send-email.php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

require 'vendor/autoload.php';

function sendPurchaseEmail($customerEmail, $customerName, $products) {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'mail.your-domain.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'noreply@your-domain.com';
        $mail->Password   = 'your-email-password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        $mail->setFrom('noreply@your-domain.com', 'FameChase');
        $mail->addAddress($customerEmail, $customerName);

        $mail->isHTML(true);
        $mail->Subject = 'Your FameChase Purchase - Download Links';
        $mail->Body    = generateEmailTemplate($customerName, $products);

        $mail->send();
        return true;
    } catch (Exception $e) {
        return false;
    }
}
?>
```

---

## 🔒 STEP 6: Security Setup

### 6.1 Security Headers

Add to `.htaccess`:

```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

### 6.2 File Protection

```apache
# Protect sensitive files
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "*.md">
    Order allow,deny
    Deny from all
</Files>
```

---

## 📊 STEP 7: Analytics & Monitoring

### 7.1 Google Analytics Setup

```html
<!-- Add to index.html -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "GA_MEASUREMENT_ID");
</script>
```

### 7.2 Error Monitoring

```javascript
// Add to main app file
window.addEventListener("error", function (e) {
  fetch("/api/log-error.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      error: e.error.toString(),
      stack: e.error.stack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }),
  });
});
```

---

## 🚀 STEP 8: Deployment Checklist

### 8.1 Pre-Launch Checklist

- [ ] All files uploaded to public_html
- [ ] .htaccess configured
- [ ] SSL certificate active
- [ ] Domain pointing correctly
- [ ] Razorpay integration tested
- [ ] Payment flow working
- [ ] Download links functional
- [ ] Email notifications setup
- [ ] Error monitoring active
- [ ] Analytics configured
- [ ] Mobile responsiveness checked
- [ ] Load speed optimized
- [ ] SEO meta tags added

### 8.2 Post-Launch Monitoring

```bash
# Monitor these metrics:
1. Page load speed (< 3 seconds)
2. Payment success rate (> 95%)
3. Download completion rate (> 98%)
4. Email delivery rate (> 95%)
5. Error rate (< 1%)
6. Mobile compatibility (100%)
```

---

## 🔄 STEP 9: Maintenance & Updates

### 9.1 Regular Updates

```bash
# Weekly tasks:
1. Monitor payment transactions
2. Check download links
3. Review error logs
4. Update content if needed
5. Backup database

# Monthly tasks:
1. Security updates
2. Performance optimization
3. Analytics review
4. User feedback analysis
```

### 9.2 Backup Strategy

```bash
# Setup automated backups in cPanel
1. Enable daily file backups
2. Enable database backups
3. Store backups offsite
4. Test backup restoration monthly
```

---

## 📞 Support & Troubleshooting

### Common Issues & Solutions:

**Issue**: Payment not working
**Solution**: Check Razorpay API keys and webhook URLs

**Issue**: Downloads not starting
**Solution**: Verify file permissions and .htaccess rules

**Issue**: Emails not sending
**Solution**: Check SMTP settings and email authentication

**Issue**: Site not loading
**Solution**: Verify DNS settings and SSL configuration

---

## 🎯 Success Metrics

Track these KPIs after launch:

- Conversion rate: >3%
- Payment success rate: >95%
- Download completion: >98%
- Page load speed: <3 seconds
- Mobile compatibility: 100%
- Customer satisfaction: >4.5/5

---

**📧 Support Contact**: technical-support@your-domain.com
**🔧 Emergency**: Create ticket in MilesWeb support portal
**📱 Status Page**: https://status.your-domain.com
