import { CommerceService } from '@composable/types'

const hasKey = <T extends object>(obj: T, k: keyof any): k is keyof T =>
  k in obj

export const commerceWithDiscount = (commerceService: CommerceService) => {
  return commerceService
}
// export const commerceWithDiscount = (commerceService: CommerceService) => {

//     return new Proxy(commerceService, {
//         get: function (target, prop) {

//             if(prop === 'getCart'){
//                 return async (...props: Parameters<CommerceService["getCart"]>) => {
//                     console.log('get cart items params', props)

//                     const cart = await target.getCart(...props)

//                     console.log('result', cart)

//                     return new Promise(resolve => cart)
//                 }
//             }

//             return hasKey(target, prop) ? target[prop] : () => {
//                 throw new Error('Function deos not exists')
//             };
//           }
//     });
// }
