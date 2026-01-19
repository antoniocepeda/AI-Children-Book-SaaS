import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.badge}>✨ Create Magic with AI</div>
          <h1 className={styles.title}>
            Personalized Stories, <br />
            <span className={styles.gradientText}>Unforgettable Memories</span>
          </h1>
          <p className={styles.subtitle}>
            Transform your child into the hero of a beautifully illustrated adventure.
            Craft unique 11-page picture books in minutes—no writing skills required.
          </p>
          <div className={styles.ctas}>
            <Link href="/signup" className={styles.primaryButton}>
              Start Creating Now
            </Link>
            <Link href="/login" className={styles.secondaryButton}>
              Sign In
            </Link>
          </div>
        </section>

        {/* Features Layout */}
        <section className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>🧙‍♂️</div>
            <h3 className={styles.featureTitle}>The Hero is Yours</h3>
            <p className={styles.featureText}>
              Input your child’s name and details. Our AI weaves them into the narrative, making every page feel truly special.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>🎨</div>
            <h3 className={styles.featureTitle}>Stunning Artwork</h3>
            <p className={styles.featureText}>
              Generate consistent, high-quality illustrations for every scene. A complete visual experience from cover to end.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.iconWrapper}>📚</div>
            <h3 className={styles.featureTitle}>Print-Ready PDF</h3>
            <p className={styles.featureText}>
              Download a professional PDF of your story instantly. Perfect for bedtime reading or printing as a keepsake.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.sectionBlock}>
          <h2 className={styles.sectionHeading}>How It Works</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h4 className={styles.stepTitle}>Imagine</h4>
              <p className={styles.stepDesc}>Tell us your child&apos;s name, age, and a fun theme like &quot;Space Adventure&quot; or &quot;Forest Tea Party.&quot;</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h4 className={styles.stepTitle}>Generate</h4>
              <p className={styles.stepDesc}>Watch as our AI writes the story and paints the pictures in real-time.</p>
            </div>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h4 className={styles.stepTitle}>Cherish</h4>
              <p className={styles.stepDesc}>Download your unique book and share the magic with your little one.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Storybook Magic. Built for dreamers.</p>
      </footer>
    </div>
  );
}
