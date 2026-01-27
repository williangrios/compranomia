// src/utils/errorMessages.ts

export const errorMessages: Record<string, string> = {
  // Erros gerais
  GenericError: 'Ocorreu um erro. Tente novamente.',
  ConnectionError: 'Erro de conexão. Verifique sua internet.',
  TimeoutError: 'Tempo de espera esgotado. Tente novamente.',

  // Autenticação
  EmailInUse:
    'Este email já está em uso. Caso tenha esquecido sua senha, clique em Recuperar Senha na tela de login',
  InvalidEmail: 'Email inválido.',
  InvalidRole: 'Tipo de usuário inválido.',
  PasswordAndConfirmationDoesNotMatch: 'As senhas não conferem.',
  NotEnoughPassword: 'A senha deve ter entre 6 e 30 caracteres.',
  NotEnoughPasswordConfirmation:
    'A confirmação de senha deve ter entre 6 e 30 caracteres.',
  InvalidCredentials: 'Email ou senha incorretos.',
  UserNotFound: 'Usuário não encontrado.',
  BlockedUser: 'Usuário bloqueado. Entre em contato com o suporte.',

  // Nickname
  ProvideNickName: 'Apelido é obrigatório.',
  NickNameMinLength: 'Apelido deve ter no mínimo 3 caracteres.',
  NickNameMaxLength: 'Apelido deve ter no máximo 20 caracteres.',
  NickNameAlreadyInUse: 'Este apelido já está em uso.',
  NickNameCannotEndWithHyphen: 'Apelido não pode terminar com hífen (-).',

  // País
  ProvideCountry: 'País é obrigatório.',
  CountryNotSupported: 'País não suportado.',

  // Tenant
  ProvideTenant: 'Tenant é obrigatório.',
  InvalidTenant: 'Tenant inválido.',

  // Cupom
  SellersCannotUseCoupons: 'Vendedores não podem usar cupons.',

  // Email verification
  InvalidOrExpiredLink: 'Código inválido ou expirado.',
  EmailVerified: 'Email verificado com sucesso!',
  ProvideCode: 'Código é obrigatório.',

  // Endereço
  ProvideCEP: 'CEP é obrigatório.',
  ProvideStreet: 'Rua é obrigatória.',
  ProvideNumber: 'Número é obrigatório.',
  ProvideNeighborhood: 'Bairro é obrigatório.',
  ProvideCity: 'Cidade é obrigatória.',
  ProvideState: 'Estado é obrigatório.',
  DeliveryAddressNotFound: 'Endereço não encontrado.',
  UnauthorizedToUpdateAddress:
    'Você não tem permissão para atualizar este endereço.',
  CannotUpdateInactiveAddress: 'Não é possível atualizar um endereço inativo.',

  // Autorização
  Unauthorized: 'Não autorizado.',
  NotAuthorized: 'Você não tem permissão para acessar este recurso.',
  NotFound: 'Não encontrado.',

  // Rate limit
  TooManyRequests: 'Muitas tentativas. Aguarde um momento.',
}

export function translateError(errorKey: string): string {
  return errorMessages[errorKey] || errorKey
}
