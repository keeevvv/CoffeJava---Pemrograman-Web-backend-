# CoffeJava---Pemrograman-Web-backend-
project backend kelompok coffe java

untuk menjalankan project ini di local
1. nyalakan database lokal
2. ketik comand npm install
3. ketik npm install prisma --save-dev
4. ketik comamand npx prisma init
5. buat file .env tambahkanan DATABASE_URL yang disi dengan url database mysql, ACCESS_TOKEN dan REFRESH_TOKEN yang diisi bebas dengan apapun (note semakin random dan panjang token akan sekamin aman)
6. npx prisma migrate dev --name "(bebas isi apa)" 
7. untuk menjalankan project install nodemon dan jalankan command npm run dev atau jika tidak ada nodemon bisa menggunakan command node index.js

