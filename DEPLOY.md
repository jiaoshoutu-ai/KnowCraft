# HappyLearning 后端部署指南

## 阿里云轻量服务器部署

### 1. 服务器初始化

```bash
# SSH 登录服务器
ssh root@your-server-ip

# 系统更新
apt update && apt upgrade -y    # Ubuntu/Debian
# 或
yum update -y                    # CentOS

# 安装基础软件
apt install -y python3.13 python3.13-venv python3.13-dev nginx git curl
# Ubuntu 没有 3.13 的话用 deadsnakes PPA:
# add-apt-repository ppa:deadsnakes/ppa && apt update && apt install python3.13 python3.13-venv
```

### 2. 部署代码

```bash
# 创建应用目录
mkdir -p /opt/happylearning
cd /opt/happylearning

# 方式A: 从 GitHub 拉取（推荐）
git clone https://github.com/your-user/happylearning.git .

# 方式B: 本地 rsync 推送
# 在你本地执行：
# rsync -avz --exclude venv --exclude __pycache__ backend/ root@server-ip:/opt/happylearning/backend/

# 创建虚拟环境
cd backend
python3.13 -m venv venv
venv/bin/pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
vim .env
# 填入真实的 DASHSCOPE_API_KEY
```

### 3. Systemd 服务（进程守护）

```bash
cat > /etc/systemd/system/happylearning.service << 'EOF'
[Unit]
Description=HappyLearning Backend
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/happylearning/backend
ExecStart=/opt/happylearning/backend/venv/bin/python run.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

# 设置权限
chown -R www-data:www-data /opt/happylearning

# 启动服务
systemctl daemon-reload
systemctl enable happylearning
systemctl start happylearning

# 查看状态
systemctl status happylearning
journalctl -u happylearning -f    # 查看日志
```

### 4. Nginx 反向代理

```bash
cat > /etc/nginx/sites-available/happylearning << 'EOF'
server {
    listen 80;
    server_name api.yourdomain.com;    # 替换为你的域名

    # REST API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;    # WebSocket 长连接超时
        proxy_send_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000;
    }
}
EOF

ln -s /etc/nginx/sites-available/happylearning /etc/nginx/sites-enabled/
nginx -t              # 检查配置
systemctl reload nginx
```

### 5. HTTPS 证书（Let's Encrypt）

```bash
# 安装 certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（确保域名已解析到服务器 IP）
certbot --nginx -d api.yourdomain.com

# 自动续期（certbot 会自动添加 cron）
certbot renew --dry-run
```

### 6. 阿里云安全组配置

在阿里云控制台 → 轻量应用服务器 → 防火墙，放行：

| 端口 | 协议 | 说明 |
|------|------|------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS |

> ⚠️ **不要**开放 8000 端口，所有流量走 Nginx 代理

### 7. 域名解析

在你的域名 DNS 管理处添加：

```
类型    主机记录    记录值
A       api         your-server-ip
```

### 8. 部署后的更新流程

```bash
# SSH 到服务器
cd /opt/happylearning
git pull

# 如果有新依赖
cd backend && venv/bin/pip install -r requirements.txt

# 重启服务
systemctl restart happylearning

# 检查日志
journalctl -u happylearning -f --no-pager -n 20
```

### 9. 常用运维命令速查

```bash
# 服务管理
systemctl start happylearning     # 启动
systemctl stop happylearning      # 停止
systemctl restart happylearning   # 重启
systemctl status happylearning    # 状态

# 日志
journalctl -u happylearning -f    # 实时日志
journalctl -u happylearning --since "1 hour ago"   # 最近1小时
journalctl -u happylearning --since today           # 今天

# Nginx
nginx -t                          # 检查配置
systemctl reload nginx            # 重载配置
tail -f /var/log/nginx/error.log  # Nginx 错误日志
tail -f /var/log/nginx/access.log # Nginx 访问日志

# 测试接口
curl http://localhost:8000/health
curl https://api.yourdomain.com/api/topics
```

### 10. 前端对接时的配置

GitHub Pages 上的前端只需要把 API 地址改成你的域名：

```javascript
// 前端配置
const API_BASE = 'https://api.yourdomain.com';
const WS_BASE = 'wss://api.yourdomain.com';
```

---

**核心架构**: Systemd 守护进程 + Nginx 反向代理 + HTTPS
