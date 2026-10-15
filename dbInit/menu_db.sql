-- ============================================
-- TABLA: categorias
-- ============================================

CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================
-- TABLA: platos
-- ============================================

CREATE TABLE platos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(10,2) NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    imagen VARCHAR(500),
    categoria_id BIGINT NOT NULL,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    stock INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT fk_plato_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_platos_categoria
ON platos(categoria_id);

CREATE INDEX idx_platos_disponible
ON platos(disponible);

-- ============================================
-- CATEGORÍAS
-- ============================================

INSERT INTO categorias (id, nombre, descripcion, activo) VALUES
(1, 'Entradas', 'Entradas y aperitivos', TRUE),
(2, 'Platos Principales', 'Platos principales de la carta', TRUE),
(3, 'Hamburguesas', 'Hamburguesas artesanales', TRUE),
(4, 'Pastas', 'Pastas y platos italianos', TRUE),
(5, 'Ensaladas', 'Ensaladas frescas', TRUE),
(6, 'Bebidas', 'Bebidas frías y calientes', TRUE),
(7, 'Postres', 'Postres y dulces', TRUE),
(8, 'Promociones', 'Combos y promociones especiales', TRUE);

-- ============================================
-- PLATOS
-- ============================================

INSERT INTO platos
(id, nombre, descripcion, precio, disponible, imagen, categoria_id, stock)
VALUES

-- Entradas
(1, 'Tequeños de Queso', 'Tequeños rellenos de queso acompañados de salsa.', 12.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921094/teque%C3%B1os.jpg', 1, 45),
(2, 'Alitas BBQ', 'Alitas de pollo bañadas en salsa BBQ.', 18.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921317/Alitasbbq.jpg', 1, 30),
(3, 'Papa a la Huancaína', 'Papas acompañadas de crema de ají amarillo y queso.', 10.00, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921345/papa-a-la-huancaina.jpg', 1, 38),
(4, 'Choclo con Queso', 'Choclo peruano acompañado de queso fresco.', 9.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921379/choclo-con-queso.jpg', 1, 25),

-- Platos Principales
(5, 'Lomo Saltado', 'Lomo de res salteado con cebolla, tomate y papas fritas.', 28.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921409/lomo-saltado.jpg', 2, 20),
(6, 'Pollo a la Brasa', 'Pollo a la brasa acompañado de papas fritas y ensalada.', 24.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921433/pollo-a-la-brasa.jpg', 2, 15),
(7, 'Arroz Chaufa', 'Arroz chaufa estilo peruano con pollo y verduras.', 22.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921463/Arrozchaufa.jpg', 2, 28),
(8, 'Ají de Gallina', 'Pollo deshilachado en crema de ají amarillo.', 21.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921510/Aj%C3%AD_de_Gallina.jpg', 2, 18),
(9, 'Ceviche Clásico', 'Pescado fresco marinado en limón con cebolla y ají.', 26.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921538/Ceviche_Cl%C3%A1sico.jpg', 2, 12),

-- Hamburguesas
(10, 'Hamburguesa Clásica', 'Hamburguesa de carne con queso, lechuga y tomate.', 18.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921569/hamburguesa-clasica.jpg', 3, 50),
(11, 'Hamburguesa BBQ', 'Hamburguesa de carne con queso y salsa BBQ.', 23.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921592/Hamburguesa_BBQ.jpg', 3, 35),
(12, 'Hamburguesa Doble', 'Doble hamburguesa de carne con queso.', 27.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921615/Hamburguesa_Doble.jpg', 3, 22),
(13, 'Hamburguesa Crispy Chicken', 'Hamburguesa de pollo crispy con lechuga y salsa especial.', 21.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921643/Hamburguesa_Crispy_Chicken.jpg', 3, 40),

-- Pastas
(14, 'Spaghetti a la Bolognesa', 'Spaghetti con salsa de carne y tomate.', 22.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921720/Spaghetti_a_la_Bolognesa.jpg', 4, 26),
(15, 'Fettuccine Alfredo', 'Fettuccine en salsa cremosa Alfredo.', 24.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921744/Fettuccine_Alfredo.jpg', 4, 19),
(16, 'Lasagna de Carne', 'Lasagna rellena de carne, salsa de tomate y queso.', 25.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791921772/Lasagna_de_Carne.jpg', 4, 14),

-- Ensaladas
(17, 'Ensalada César', 'Lechuga, pollo, crutones y aderezo César.', 17.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922487/Ensalada_C%C3%A9sar.jpg', 5, 32),
(18, 'Ensalada Mediterránea', 'Ensalada fresca con tomate, aceitunas y queso.', 16.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922514/Ensalada_Mediterr%C3%A1nea.jpg', 5, 27),
(19, 'Ensalada de Pollo', 'Ensalada fresca acompañada de pollo a la parrilla.', 19.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922544/Ensalada_de_Pollo.png', 5, 21),

-- Bebidas
(20, 'Inca Kola 500ml', 'Bebida gaseosa Inca Kola.', 4.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922568/Inca_Kola_500ml.jpg', 6, 120),
(21, 'Coca Cola 500ml', 'Bebida gaseosa Coca Cola.', 4.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922590/Coca_Cola_500ml.jpg', 6, 110),
(22, 'Chicha Morada', 'Bebida tradicional peruana de maíz morado.', 7.00, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922615/Chicha_Morada.jpg', 6, 60),
(23, 'Limonada', 'Limonada natural.', 6.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922640/Limonada.jpg', 6, 75),
(24, 'Café Americano', 'Café americano caliente.', 5.50, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922663/Caf%C3%A9_Americano.jpg', 6, 90),

-- Postres
(25, 'Cheesecake de Fresa', 'Cheesecake con cobertura de fresa.', 12.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922690/Cheesecake_de_Fresa.png', 7, 16),
(26, 'Torta de Chocolate', 'Torta de chocolate con cobertura.', 13.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922714/Torta_de_Chocolate.jpg', 7, 12),
(27, 'Tres Leches', 'Clásico pastel tres leches.', 11.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922735/Tres_Leches.jpg', 7, 18),
(28, 'Brownie con Helado', 'Brownie de chocolate acompañado de helado.', 14.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922760/Brownie_con_Helado.jpg', 7, 10),

-- Promociones
(29, 'Combo Clásico', 'Hamburguesa clásica, papas y bebida.', 25.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922803/Hamburguesa_cl%C3%A1sica_papas_y_bebida.jpg', 8, 40),
(30, 'Combo Familiar', 'Combo familiar para compartir.', 69.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922825/Combo_Familiar.jpg', 8, 8),
(31, 'Combo Pollo', 'Pollo acompañado de papas y bebida.', 29.90, TRUE, 'https://res.cloudinary.com/xs7lmitw/image/upload/v1791922849/Combo_Pollo.jpg', 8, 33),

-- Plato temporal para probar disponibilidad (sin stock)
(32, 'Plato Temporal', 'Plato utilizado para probar el estado de disponibilidad.', 15.00, FALSE, '', 8, 0);

-- ============================================
-- SINCRONIZAR SECUENCIAS
-- (los INSERT con id explícito no avanzan el BIGSERIAL)
-- ============================================

SELECT setval(
    pg_get_serial_sequence('categorias', 'id'),
    (SELECT MAX(id) FROM categorias)
);

SELECT setval(
    pg_get_serial_sequence('platos', 'id'),
    (SELECT MAX(id) FROM platos)
);