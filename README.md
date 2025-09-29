# ClaimIT - Lost and Found Campus App

A comprehensive mobile application for reporting, searching, and claiming lost and found items on campus. Built with Expo React Native and Supabase.

## Features

- **University Email Authentication** with role-based access (Student, Staff, Teacher, Admin)
- **Item Reporting** with image upload and detailed descriptions
- **Search & Filter** by category, location, and status
- **Claim Process** with admin (SID) approval workflow
- **Real-time Messaging** between users and administrators
- **QR Code Generation** for item verification
- **User Profiles** with statistics and points system
- **Admin Dashboard** for Security Intelligence Division (SID)

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (Authentication, Database, Real-time)
- **Database**: PostgreSQL (via Supabase)
- **File Storage**: Supabase Storage (for images)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## Project Structure

```
├── app/                    # App screens and navigation
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── hooks/                # Custom hooks
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd claimit-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Create a `.env` file based on `.env.example`
   - Set up the database schema (see Database Schema section)

4. **Run the app**
   ```bash
   npm run dev
   ```

## Database Schema

The app uses the following main tables:

### Users Table
```sql
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('student', 'staff', 'teacher', 'admin')),
  address text,
  mobile_number text,
  school_id_number text,
  department text,
  points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Items Table
```sql
create table items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  category text not null,
  location text not null,
  date_lost_found date not null,
  image_url text,
  status text default 'active' check (status in ('active', 'claimed', 'archived')),
  item_type text not null check (item_type in ('lost', 'found')),
  posted_by uuid references users(id) on delete cascade not null,
  qr_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Claims Table
```sql
create table claims (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references items(id) on delete cascade not null,
  claimant_id uuid references users(id) on delete cascade not null,
  reason text not null,
  proof_image_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

### Messages Table
```sql
create table messages (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references items(id) on delete cascade,
  claim_id uuid references claims(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade not null,
  recipient_id uuid references users(id) on delete cascade not null,
  content text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## Key Features Implementation

### Authentication
- University email validation
- Role-based access control
- Persistent sessions with AsyncStorage

### Item Management
- Multi-category support (Electronics, Apparel, Books, etc.)
- Image upload capability
- Status tracking (Active, Claimed, Archived)
- QR code generation for verification

### Claim Process
- Structured claim submission
- Proof image upload
- Admin approval workflow
- Status updates and notifications

### User Experience
- Tab-based navigation
- Floating action button for quick reporting
- Card-based item display
- Responsive design for all screen sizes

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Environment Variables
Create a `.env` file with the following variables:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running on Devices
- **iOS**: Use Expo Go app or create a development build
- **Android**: Use Expo Go app or create a development build
- **Web**: Runs in browser automatically

## Deployment

The app can be deployed to:
- **App Stores**: Using EAS Build and Submit
- **Web**: Using Expo for Web
- **Internal Distribution**: Using EAS Update

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, contact the development team or create an issue in the repository.