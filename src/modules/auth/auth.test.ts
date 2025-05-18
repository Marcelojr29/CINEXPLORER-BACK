import { app } from "../../http/server";
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from "../../lib/prisma";
import bcrypt from 'bcryptjs'

describe('Auth Routes', () => {
    beforeAll(async () => {
        await app.ready()
    })

    afterAll(async () => {
        await app.close()
    })

    it('should authenticate admin with valid credentials', async () => {
        const hashedPassword = await bcrypt.hash('admin123', 10)

        await prisma.admin.create({
            data: {
                name: 'Test Admin',
                email: 'test@admin.com',
                password: hashedPassword
            }
        })

        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'test@admin.com',
                password: 'admin123'
            }
        })

        expect(response.statusCode).toBe(200)
        expect(response.json()).toHaveProperty('token')
    })

    it('should not authenticate with invalid credentials', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'wrong@email.com',
                password: 'wrongpassword'
            }
        })

        expect(response.statusCode).toBe(401)
        expect(response.json()).toEqual({ message: 'Invalid credentials' })
    })
})