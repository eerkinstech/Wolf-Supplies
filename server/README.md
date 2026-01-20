# Server

This Express + MongoDB server provides the backend API for the ShopHub frontend.

## Environment Variables
Create a `.env` file in `server/` with these variables:

- `MONGODB_URI` - MongoDB connection string (default: `mongodb://localhost:27017/ecommerce`)
- `PORT` - server port (default: 5000)
- `JWT_SECRET` - secret for signing JWT tokens
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Available Scripts
- `npm run dev` - runs server with nodemon
- `npm start` - runs server with node

## Routes (overview)
- `GET /` - welcome
- `GET /api/health` - health check
- `POST /api/users/register` - register
- `POST /api/users/login` - login
- `GET /api/users/profile` - get profile (requires Bearer token)
- `GET /api/categories` - list categories
- `POST /api/categories` - create category (admin)
- `GET /api/products` - list products
- `POST /api/products` - create product (admin)
- `POST /api/upload` - upload image (admin)

## Notes
- Admin-protected routes require the authenticated user to have `role: 'admin'`.
- Files are uploaded to Cloudinary; set cloudinary env variables to enable.

