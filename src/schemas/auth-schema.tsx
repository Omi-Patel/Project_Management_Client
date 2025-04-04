import * as z from 'zod'

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, 'Password is required'),
})

export type TLogin = z.infer<typeof loginSchema>

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type TUpdatePassword = z.infer<typeof updatePasswordSchema>

export type TAuthResponse = {
  accessToken: string
  refreshToken: string
}

export type TUserJwtInformation = {
  sub: string
  userId: string
  email: string
  roles: string[]
  iat: number
  exp: number
}

export type TRefreshTokenRequest = {
  refreshToken: string
}

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type TChangePassword = z.infer<typeof changePasswordSchema>