export type accountData = {
   createdDate: string
   email: string
   id: number
   username: string
   role: Roles
}

export enum Roles {
   Client = 'Client',
   Artisan = 'Artisan',
   Admin = 'Admin'
}
