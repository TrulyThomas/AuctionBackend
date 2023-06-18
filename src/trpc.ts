import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from './index'

const trpc = createTRPCProxyClient<AppRouter>({
   links: [
      httpBatchLink({
         url: 'http://localhost:5000'
      })
   ]
})

export default trpc