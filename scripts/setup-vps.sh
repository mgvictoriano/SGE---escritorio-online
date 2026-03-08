#!/bin/bash
# =============================================================================
# Script de configuração inicial da VPS - SGE Escritório Online
# Ubuntu 22.04 LTS
# Executar como root: bash setup-vps.sh
# =============================================================================

set -e  # Para se qualquer comando falhar

echo "============================================="
echo " SGE - Configuração inicial da VPS"
echo "============================================="

# -----------------------------------------------------------------------------
# 1. Atualiza o sistema
# -----------------------------------------------------------------------------
echo ""
echo "[1/7] Atualizando o sistema..."
apt update && apt upgrade -y

# -----------------------------------------------------------------------------
# 2. Instala dependências básicas
# -----------------------------------------------------------------------------
echo ""
echo "[2/7] Instalando dependências básicas..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    ufw \
    fail2ban \
    htop \
    nano

# -----------------------------------------------------------------------------
# 3. Instala Docker + Docker Compose
# -----------------------------------------------------------------------------
echo ""
echo "[3/7] Instalando Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Instala Docker Compose plugin
apt install -y docker-compose-plugin

docker --version
docker compose version

# -----------------------------------------------------------------------------
# 4. Instala Nginx + Certbot (SSL gratuito)
# -----------------------------------------------------------------------------
echo ""
echo "[4/7] Instalando Nginx e Certbot..."
apt install -y nginx certbot python3-certbot-nginx
systemctl enable nginx
systemctl start nginx

# -----------------------------------------------------------------------------
# 5. Configura o Firewall (UFW)
# -----------------------------------------------------------------------------
echo ""
echo "[5/7] Configurando firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh        # SSH para você acessar a VPS
ufw allow http       # Porta 80
ufw allow https      # Porta 443
ufw --force enable

echo "Regras do firewall:"
ufw status

# -----------------------------------------------------------------------------
# 6. Configura o Fail2Ban (proteção contra força bruta)
# -----------------------------------------------------------------------------
echo ""
echo "[6/7] Configurando Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban

# -----------------------------------------------------------------------------
# 7. Cria estrutura de pastas do projeto
# -----------------------------------------------------------------------------
echo ""
echo "[7/7] Criando estrutura de pastas..."
mkdir -p /opt/sge
mkdir -p /data/postgres
mkdir -p /data/backups

# Permissões para o postgres no Docker funcionar corretamente
chmod 700 /data/postgres

# Agenda o backup diário às 2h da manhã
echo "0 2 * * * root bash /opt/sge/scripts/backup.sh >> /var/log/sge-backup.log 2>&1" \
    > /etc/cron.d/sge-backup

echo ""
echo "============================================="
echo " Configuração concluída!"
echo "============================================="
echo ""
echo "Proximos passos:"
echo ""
echo "  1. Clone o repositório:"
echo "     cd /opt/sge"
echo "     git clone https://github.com/mgvictoriano/SGE---escritorio-online.git ."
echo ""
echo "  2. Crie o arquivo .env com as senhas:"
echo "     cp .env.example .env"
echo "     nano .env"
echo ""
echo "  3. Configure o domínio no nginx/nginx.conf"
echo ""
echo "  4. Gere o certificado SSL (substitua pelo seu domínio):"
echo "     certbot --nginx -d seu-dominio.com"
echo ""
echo "  5. Suba os containers:"
echo "     docker compose up -d"
echo ""
