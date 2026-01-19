import { Metadata } from 'next';
import { BookForm } from '@/components/create/BookForm';

export const metadata: Metadata = {
    title: 'Create Story | Storybook Magic',
    description: 'Create a personalized children\'s book with AI',
};

export default function CreateBookPage() {
    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
                textAlign: 'center',
                marginBottom: '2rem',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: 'var(--foreground)'
            }}>
                Create a New Story
            </h1>
            <BookForm />
        </div>
    );
}
