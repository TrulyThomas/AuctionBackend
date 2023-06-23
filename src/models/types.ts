type accountData = {
   createdDate: string
   email: string
   id: number
   username: string
   role: Roles
}

enum Roles {
   Client = 'Client',
   Artisan = 'Artisan',
   Admin = 'Admin'
}
