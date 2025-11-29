import { sql } from "@vercel/postgres"

let isInitialized = false

export async function initializeDatabase() {
  if (isInitialized) {
    return
  }

  try {
    console.log("Verificando schema do banco de dados...")

    // Verificar se as tabelas existem
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `

    const tablesExist = result.rows[0].exists

    if (!tablesExist) {
      console.log("Tabelas não existem. Criando schema...")

      // Criar tabelas
      await sql`
        -- Products table
        CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          sku VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          category_id INTEGER,
          barcode VARCHAR(100),
          description TEXT,
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Categories table
        CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Evaluation criteria table
        CREATE TABLE criteria (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          weight DECIMAL(3, 2),
          max_score INTEGER DEFAULT 10,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(category_id, name)
        );

        -- Employees table
        CREATE TABLE employees (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('operator', 'manager', 'admin')),
          store_location VARCHAR(255),
          password_hash VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Evaluations table
        CREATE TABLE evaluations (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          employee_id INTEGER NOT NULL REFERENCES employees(id),
          evaluation_date DATE NOT NULL,
          store_location VARCHAR(255),
          status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'reviewed')),
          notes TEXT,
          sync_status VARCHAR(50) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'failed')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Evaluation scores table
        CREATE TABLE evaluation_scores (
          id SERIAL PRIMARY KEY,
          evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
          criteria_id INTEGER NOT NULL REFERENCES criteria(id),
          score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `

      // Adicionar chave estrangeira
      await sql`
        ALTER TABLE products ADD CONSTRAINT fk_products_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
      `

      // Criar índices
      await sql`
        CREATE INDEX idx_products_sku ON products(sku);
        CREATE INDEX idx_products_category ON products(category_id);
        CREATE INDEX idx_evaluations_product ON evaluations(product_id);
        CREATE INDEX idx_evaluations_employee ON evaluations(employee_id);
        CREATE INDEX idx_evaluations_date ON evaluations(evaluation_date);
        CREATE INDEX idx_evaluation_scores_evaluation ON evaluation_scores(evaluation_id);
      `

      console.log("Schema criado com sucesso!")

      // Popular dados
      console.log("Populando dados iniciais...")

      // Popular funcionários
      await sql`
        INSERT INTO employees (email, name, role, store_location, password_hash, is_active) VALUES
        ('operator@store.com', 'John Smith', 'operator', 'Store A', 'demo', true),
        ('operator2@store.com', 'Maria Garcia', 'operator', 'Store B', 'demo', true),
        ('manager@store.com', 'David Johnson', 'manager', 'Store A', 'demo', true),
        ('admin@store.com', 'Alice Brown', 'admin', 'Headquarters', 'demo', true);
      `

      // Popular categorias
      await sql`
        INSERT INTO categories (name, description) VALUES
        ('Electronics', 'Electronic devices and gadgets'),
        ('Clothing', 'Apparel and fashion items'),
        ('Home & Garden', 'Home improvement and garden supplies'),
        ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
        ('Books & Media', 'Books, music, movies, and games'),
        ('Food & Beverages', 'Food products and drinks'),
        ('Health & Beauty', 'Health products and beauty items'),
        ('Toys & Games', 'Toys and gaming products'),
        ('Automotive', 'Car parts and accessories'),
        ('Miscellaneous', 'Other products')
        ON CONFLICT DO NOTHING;
      `

      // Popular critérios para cada categoria
      await sql`
        INSERT INTO criteria (category_id, name, weight, max_score)
        SELECT id, 'Build Quality', 1.0, 10 FROM categories WHERE name = 'Electronics'
        UNION ALL SELECT id, 'Functionality', 1.2, 10 FROM categories WHERE name = 'Electronics'
        UNION ALL SELECT id, 'Design', 0.8, 10 FROM categories WHERE name = 'Electronics'
        UNION ALL SELECT id, 'Value for Money', 1.0, 10 FROM categories WHERE name = 'Electronics'
        UNION ALL SELECT id, 'Material Quality', 1.0, 10 FROM categories WHERE name = 'Clothing'
        UNION ALL SELECT id, 'Fit & Comfort', 1.2, 10 FROM categories WHERE name = 'Clothing'
        UNION ALL SELECT id, 'Design & Style', 1.0, 10 FROM categories WHERE name = 'Clothing'
        UNION ALL SELECT id, 'Durability', 0.8, 10 FROM categories WHERE name = 'Clothing'
        UNION ALL SELECT id, 'Quality', 1.0, 10 FROM categories WHERE name = 'Home & Garden'
        UNION ALL SELECT id, 'Functionality', 1.2, 10 FROM categories WHERE name = 'Home & Garden'
        UNION ALL SELECT id, 'Aesthetics', 0.8, 10 FROM categories WHERE name = 'Home & Garden'
        UNION ALL SELECT id, 'Performance', 1.3, 10 FROM categories WHERE name = 'Sports & Outdoors'
        UNION ALL SELECT id, 'Comfort', 0.9, 10 FROM categories WHERE name = 'Sports & Outdoors'
        UNION ALL SELECT id, 'Content Quality', 1.5, 10 FROM categories WHERE name = 'Books & Media'
        UNION ALL SELECT id, 'Presentation', 0.7, 10 FROM categories WHERE name = 'Books & Media'
        UNION ALL SELECT id, 'Taste', 1.5, 10 FROM categories WHERE name = 'Food & Beverages'
        UNION ALL SELECT id, 'Freshness', 1.3, 10 FROM categories WHERE name = 'Food & Beverages'
        UNION ALL SELECT id, 'Packaging', 0.7, 10 FROM categories WHERE name = 'Food & Beverages'
        UNION ALL SELECT id, 'Effectiveness', 1.4, 10 FROM categories WHERE name = 'Health & Beauty'
        UNION ALL SELECT id, 'Ingredients', 1.1, 10 FROM categories WHERE name = 'Health & Beauty'
        UNION ALL SELECT id, 'Fun Factor', 1.4, 10 FROM categories WHERE name = 'Toys & Games'
        UNION ALL SELECT id, 'Safety', 1.3, 10 FROM categories WHERE name = 'Toys & Games';
      `

      // Popular produtos
      await sql`
        INSERT INTO products (sku, name, category_id, barcode, description) VALUES
        ('ELEC-001', 'Wireless Headphones', 1, '123456789012', 'Premium noise-cancelling headphones'),
        ('ELEC-002', 'USB-C Cable 2m', 1, '123456789013', 'High-speed USB-C charging cable'),
        ('CLOTHING-001', 'Cotton T-Shirt', 2, '123456789014', 'Classic crew neck t-shirt'),
        ('CLOTHING-002', 'Denim Jeans', 2, '123456789015', 'Classic fit blue denim jeans'),
        ('FOOD-001', 'Organic Coffee Beans 500g', 6, '123456789016', 'Fair-trade organic coffee'),
        ('FOOD-002', 'Almond Butter', 6, '123456789017', 'Natural almond butter no sugar'),
        ('GARDEN-001', 'Potting Soil 10L', 3, '123456789018', 'Premium potting mix for plants'),
        ('GARDEN-002', 'Garden Gloves', 3, '123456789019', 'Durable waterproof garden gloves');
      `

      console.log("Banco de dados inicializado com sucesso!")
    } else {
      console.log("Schema do banco de dados já existe.")
    }

    isInitialized = true
  } catch (error) {
    console.error("Erro ao inicializar banco de dados:", error)
    throw error
  }
}
