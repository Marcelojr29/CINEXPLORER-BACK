import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Criar admin principal
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.admin.create({
    data: {
      name: 'Admin Master',
      email: 'admin@cinema.com',
      password: hashedPassword
    }
  })

  // Criar alguns cinemas
  const cinema1 = await prisma.cinema.create({
    data: {
      name: 'Cinema Shopping Center',
      address: 'Av. Paulista, 1234',
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5639,
      longitude: -46.6544
    }
  })

  const cinema2 = await prisma.cinema.create({
    data: {
      name: 'Cinema Downtown',
      address: 'Rua Augusta, 567',
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5555,
      longitude: -46.6666
    }
  })

  // Criar alguns filmes
  const movie1 = await prisma.movie.create({
    data: {
      title: 'Interstellar',
      genre: 'Ficção Científica',
      duration: 169,
      rating: '12 anos',
      description: 'Um grupo de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.',
      imageUrl: 'https://example.com/interstellar.jpg'
    }
  })

  const movie2 = await prisma.movie.create({
    data: {
      title: 'The Dark Knight',
      genre: 'Ação',
      duration: 152,
      rating: '14 anos',
      description: 'Batman trava uma batalha contra o Coringa, um criminoso que mergulha Gotham City em um caos.',
      imageUrl: 'https://example.com/darkknight.jpg'
    }
  })

  // Criar algumas sessões
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  await prisma.session.createMany({
    data: [
      {
        cinemaId: cinema1.id,
        movieId: movie1.id,
        dateTime: new Date(tomorrow.setHours(14, 0, 0, 0)),
        roomType: 'IMAX',
        price: 35.90
      },
      {
        cinemaId: cinema1.id,
        movieId: movie1.id,
        dateTime: new Date(tomorrow.setHours(19, 30, 0, 0)),
        roomType: '3D',
        price: 29.90
      },
      {
        cinemaId: cinema2.id,
        movieId: movie2.id,
        dateTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
        roomType: 'Standard',
        price: 24.90
      },
      {
        cinemaId: cinema2.id,
        movieId: movie2.id,
        dateTime: new Date(tomorrow.setHours(21, 0, 0, 0)),
        roomType: 'VIP',
        price: 39.90
      }
    ]
  })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })