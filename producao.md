COMO FAZER UPGRADE DE VERSÃO
para publicar na Google Play basta rodar:
npx eas submit --platform android --path ./Compranomia.aab
para publicar na apple store basta:
npx eas submit --platform ios --path ./Compranomia.ipa
Após o envio, acesse o App Store Connect para selecionar o build na versão e submeter para review.



# Como Gerar o AAB — Compranomia

## Passo a Passo

1. Abrir o terminal WSL (Ubuntu)
2. Navegar até o projeto:
```bash
cd /mnt/c/Users/User/projetos/compranomia
```
3. Rodar o build:
```bash
npx eas build -p android --profile production --local
```
4. Aguardar ~15-20 minutos
5. O AAB gerado estará em:
```
C:\Users\User\projetos\compranomia\build-XXXXXXXXXXXX.aab
```
6. Fazer upload no Google Play Console

## para producao IOS
eas build --platform ios
Fazer upload manual no Apple store

## Se quiser mais controle, o fluxo manual é:
  eas build --platform ios        # gera e faz upload do .ipa
  eas submit --platform ios

---

## Avisos

- Sempre usar `--local` para não consumir a cota do EAS gratuito
- O `versionCode` é incrementado automaticamente a cada build

---

## Problemas Comuns

**Build Tools corrompidas** — rodar no PowerShell do Windows:
```powershell
cd C:\Users\User\AppData\Local\Android\Sdk\cmdline-tools\latest\bin
.\sdkmanager.bat --uninstall "build-tools;36.0.0"
.\sdkmanager.bat "build-tools;36.0.0"
```

**ANDROID_HOME não definido** — rodar no WSL:
```bash
source ~/.bashrc
```