ESTRUTURA DE PASTAS
app
-(auth)
--_layout.tsx
--complete-address.tsx
--forgot-password.tsx
--signin.tsx
--signup.tsx
--verify-email.tsx
--welcome.tsx
-(tabs)
--dashboard
---products
---_layout.tsx
---business-address.tsx
---business-profile.tsx
---index.tsx
---seller-settings.tsx
--notifications
---_layout.tsx
---[id].tsx
---index.tsx
--profile
---addresses
----edit
-----[id].tsx
----add.tsx
----index.tsx
---_layout.tsx
---index.tsx
---personal-data.tsx
---update-password.tsx
--sales
---_layout.tsx
---index.tsx
--_layout.tsx
--index.tsx
--orders.tsx
--search.tsx
-_layout.tsx
-index.tsx
assets
src
-components
--dashboard
---DashboardActionItem.tsx
--forms
---AddressForm.tsx
---NewProductForm.tsx
---SellerProductForm.tsx
--layout
---Screen.tsx
--modals
---AddressSelectorModal.tsx
--product
---ConsumerProductCard.tsx
---SellerProductCard.tsx
--profile
---AddressCard.tsx
---BusinessProfileForm.tsx
---Dropdown.tsx
---ProfileForm.tsx
---ProfileMenuItem.tsx
---ProfilePhotoSelector.tsx
---SellerSettingsForm.tsx
--ui
---Button.tsx
---Card.tsx
---ErrorMessage.tsx
---Header.tsx
---Input.tsx
---Loading.tsx
---ProfileHeader.tsx
---SuccessMessage.tsx
-contexts
--AddressContext.tsx
--AuthContext.tsx
--NotificationContext.tsx
-hooks
--useAddressSearch.tsx
--useApiRequest.tsx
--useAuth.tsx
--useDeliveryAddress.tsx
--useGeocode.ts
-services
--api.ts
--auth.service.ts
--deliveryAddress.service.ts
--index.ts
--notification.service.ts
--passwordService.ts
--productEnrichment.service.ts
--profile.service.ts
--sellerProduct.service.ts
--sellerSettings.service.ts
--storage.service.ts
-styles
--product.styles.ts
-theme
--colors.ts
--components.ts
--index.ts
--spacing.ts
--typography.ts
-types
--address.types.ts
--api.types.ts
--index.ts
--order.types.ts
--profile.types.ts
--sellerProduct.ts
--sellerSettings.types.ts
--user.types.ts
-utils
--enumLabels
---index.ts
---measurementUnit.labels.ts
---userTags.labels.ts
--image
---imageCompression.helper.ts
--typeguards
---isUserTag.ts
--apiCache.ts
--businessCategories.ts
--constants.ts
--errorMessages.ts
--formatters.ts
--getApiErrors.ts
--validators.ts


e também das rotsa de endereço, temos que pensar o fluxo inicial dos usuários... tanto sellers quanto consumers, já que teremos apenas um aplicativo paara aambos

por isso, entrei em 3 aplicaativos similares par estudar o fluxo
-daki
-shopper
-ifood

e vou descrever o fluxo de cada e deixar as telas aqui também
-daki:
===primeira tela já pede pra digitar o endereço
===segunda tela já pede pra mostrar no mapa (tipo confirmação) e também digitaar o numero
===terceira tela já esta no app

-shopper
===primeira tela já pede o usuário para criar conta ou entrar (coloquei prints das duas telas pra voce ver)
===segunda tela pede confirmação de email
===terceira tela já esta no app
===entrei em cadastros de endereços e vi que o endereço (exceto número da casa) estava configurado com base no cep. e ao tentar finalizar uma compra já mostra o endereço padrão mas sem o numero, devendo preencher na hora do checkout

-ifood (mais longo me pareecu)
===primeira tela pediu para ativar as notificações. eu não permiti pois a minha intenção é não colocar isso no app por enquanto para deixar mais simples para pessoas que não sbem se localizara no map
===segunda tel pediu para fazer login ou criar conta. Eu selecionei criar conta
===terceira tela pediu para colocar email
===quarta tela pediu para confirmar o email
===quinta tela pediu para fornecer o telefone
===sexta tela pediu para confirmar o telefone
===setima tela pediu nome e cpf
===oitava tela pediu endereço (coloquei mas não funcionou bem, então ativei a localização e coloquei meu endereço)
===nona tela coloquei bairro e numero da casa

essa é minha analise

agora para meu sistema, de acordo com minhas rotas etc