-- Criação de database (opcional se já especificado na URL) - manter para ambientes locais
drop database if exists ratech;
create database ratech;
use ratech;

create table if not exists tb_grupo (
    id_grupo int primary key auto_increment,
    nome varchar(50) not null unique
);

create table if not exists tb_usuario (
    id_usuario int primary key auto_increment,
    nome varchar(150) not null,
    cpf varchar(14) not null unique,
    email varchar(150) not null unique,
    senha varchar(255) not null,
    status boolean not null default true,
    id_grupo int not null,
    foreign key (id_grupo) references tb_grupo(id_grupo)
);

create table if not exists tb_produto (
    id_produto int primary key auto_increment,
    nome varchar(200) not null,
    avaliacao decimal(2,1) check (avaliacao between 1 and 5),
    descricao text,
    preco decimal(10,2) not null,
    qtd_estoque int not null default 0,
    status boolean not null default true,
    data_criacao timestamp default current_timestamp
);

create table if not exists tb_produto_imagem (
    id_imagem int primary key auto_increment,
    id_produto int not null,
    nome_arquivo varchar(255) not null,
    diretorio varchar(255) not null,
    imagem_principal boolean not null default false,
    foreign key (id_produto) references tb_produto(id_produto)
);

create table if not exists tb_cliente (
    id_cliente int primary key auto_increment,
    nome varchar(150) not null,
    cpf varchar(14) not null unique,
    email varchar(150) not null unique,
    senha varchar(255) not null,
    data_nascimento date not null,
    genero enum('MASCULINO', 'FEMININO', 'OUTRO', 'PREFIRO_NAO_INFORMAR') not null,
    status boolean not null default true,
    data_criacao timestamp default current_timestamp
);

create table if not exists tb_endereco_cliente (
    id_endereco int primary key auto_increment,
    id_cliente int not null,
    tipo enum('FATURAMENTO', 'ENTREGA') not null,
    cep varchar(9) not null,
    logradouro varchar(255) not null,
    numero varchar(20) not null,
    complemento varchar(100),
    bairro varchar(100) not null,
    cidade varchar(100) not null,
    uf varchar(2) not null,
    ativo boolean not null default true,
    data_criacao timestamp default current_timestamp,
    foreign key (id_cliente) references tb_cliente(id_cliente)
);

-- Nova tabela para endereços (sistema novo)
create table if not exists enderecos (
    id bigint primary key auto_increment,
    logradouro varchar(255) not null,
    numero varchar(10) not null,
    complemento varchar(100),
    bairro varchar(100) not null,
    cidade varchar(100) not null,
    estado varchar(2) not null,
    cep varchar(9) not null,
    cliente_id int not null,
    principal boolean not null default false,
    foreign key (cliente_id) references tb_cliente(id_cliente) on delete cascade
);

-- Inserts idempotentes para grupos
insert into tb_grupo (nome)
select * from (select 'Administrador' as nome) tmp
where not exists (select 1 from tb_grupo g where g.nome = 'Administrador');

insert into tb_grupo (nome)
select * from (select 'Estoquista' as nome) tmp
where not exists (select 1 from tb_grupo g where g.nome = 'Estoquista');

-- Hashes BCrypt gerados para senhas padrão:
-- Senha: Admin@123  -> $2a$10$A4wYV9xUqGNVgFqDblGw8e8mTnWvE5IhD7agEXZ2J1iAfDdc0AG2K
-- Senha: Estoque@123 -> $2a$10$wG1GeUXrXe3G.yUpiRaY1uCbcnZ6FQcmGeX01d9K/Y/xFdVtOfvt6

insert into tb_usuario (nome, cpf, email, senha, status, id_grupo)
select 'Admin Master', '111.111.111-11', 'admin@ratech.com', '$2a$10$A4wYV9xUqGNVgFqDblGw8e8mTnWvE5IhD7agEXZ2J1iAfDdc0AG2K', true,
       (select id_grupo from tb_grupo where nome = 'Administrador' limit 1)
where not exists (select 1 from tb_usuario u where u.email = 'admin@ratech.com');

insert into tb_usuario (nome, cpf, email, senha, status, id_grupo)
select 'João Estoquista', '222.222.222-22', 'estoquista@ratech.com', '$2a$10$wG1GeUXrXe3G.yUpiRaY1uCbcnZ6FQcmGeX01d9K/Y/xFdVtOfvt6', true,
       (select id_grupo from tb_grupo where nome = 'Estoquista' limit 1)
where not exists (select 1 from tb_usuario u where u.email = 'estoquista@ratech.com');

insert into tb_produto (nome, avaliacao, descricao, preco, qtd_estoque, status) values
('Notebook Dell', 4.5, 'Notebook Dell com 16GB RAM e SSD 512GB', 4500.00, 10, true),
('Mouse Gamer', 4.0, 'Mouse gamer RGB com 6 botões programáveis', 150.00, 30, true),
('Cadeira Escritório', 3.5, 'Cadeira ergonômica com ajuste de altura', 800.00, 5, true);

insert into tb_produto_imagem (id_produto, nome_arquivo, diretorio, imagem_principal) values
(1, 'notebook1.jpg', '/imagens/1/', true),
(1, 'notebook2.jpg', '/imagens/1/', false),
(2, 'mouse1.jpg', '/imagens/2/', true),
(3, 'cadeira1.jpg', '/imagens/3/', true);

-- Produtos gamer adicionais (15 itens) - periféricos de alta performance
insert into tb_produto (nome, avaliacao, descricao, preco, qtd_estoque, status) values
('Mouse Gamer Logitech G Pro X Superlight 2', 4.9, 'Mouse ultraleve 60g, sensor HERO 2 32K DPI, sem fio Lightspeed', 899.90, 25, true),
('Mouse Gamer Razer DeathAdder V3 Pro', 4.8, 'Design ergonômico clássico, sensor Focus Pro 30K, wireless HyperSpeed', 849.90, 20, true),
('Mousepad Gamer SteelSeries QcK Heavy XXL', 4.7, 'Superfície de tecido microtecido otimizada e base de borracha espessa', 299.90, 40, true),
('Mousepad Gamer Razer Strider Chroma', 4.6, 'Mousepad híbrido com iluminação RGB Chroma addressable', 999.00, 12, true),
('Teclado Mecânico HyperX Alloy Origins 60', 4.5, 'Formato 60%, switches HyperX Red, estrutura em alumínio', 599.90, 18, true),
('Teclado Mecânico Logitech G915 TKL', 4.8, 'Low profile wireless LIGHTSPEED RGB, switches GL Tactile', 1299.90, 10, true),
('Headset Gamer SteelSeries Arctis Nova Pro Wireless', 4.9, 'Hi-Res Audio, cancelamento ativo, base docking duplo sistema', 2999.00, 6, true),
('Headset Gamer HyperX Cloud III Wireless', 4.7, 'Espuma memory foam, 120h bateria, áudio espacial DTS', 1099.90, 14, true),
('Headset Gamer Razer BlackShark V2 Pro 2023', 4.8, 'Drivers TriForce Titanium 50mm, HyperClear Mic, HyperSpeed Wireless', 1399.90, 9, true),
('Monitor Gamer ASUS ROG Swift 27" 240Hz OLED', 4.9, 'Display OLED 1440p 240Hz, HDR, G-SYNC compatível', 7999.00, 4, true),
('Teclado Mecânico Wooting 60HE', 4.9, 'Switches Lekker Hall Effect analógicos, rapid trigger, fator 60%', 1599.00, 7, true),
('Mouse Gamer Zowie EC2-CW Wireless', 4.6, 'Forma clássica para FPS competitivos, sensor 3370 wireless', 1099.90, 11, true),
('Mousepad Gamer Artisan Ninja FX Zero XSoft XL', 4.8, 'Mousepad premium japonês equilíbrio controle x velocidade', 549.90, 15, true),
('Controle Elite Xbox Series 2', 4.7, 'Paddles traseiros, ajustes de tensão de sticks, estojo carregador', 1299.00, 8, true),
('Hub USB-C Thunderbolt 4 Gamer Base', 4.5, 'Expansão para setup multi-monitor e periféricos de baixa latência', 899.00, 5, true);

-- Tabela para carrinho de compras persistente
create table if not exists tb_carrinho_item (
    id_carrinho_item int primary key auto_increment,
    id_cliente int not null,
    id_produto int not null,
    quantidade int not null check (quantidade > 0),
    data_adicao timestamp default current_timestamp,
    data_atualizacao timestamp default current_timestamp on update current_timestamp,
    foreign key (id_cliente) references tb_cliente(id_cliente) on delete cascade,
    foreign key (id_produto) references tb_produto(id_produto) on delete cascade,
    unique key unique_cliente_produto (id_cliente, id_produto)
);

-- Tabela para pedidos
create table if not exists tb_pedido (
    id_pedido bigint primary key auto_increment,
    id_cliente int not null,
    numero_pedido varchar(50) not null unique,
    data_pedido timestamp default current_timestamp,
    status enum('PENDENTE', 'CONFIRMADO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE', 'CANCELADO') not null default 'PENDENTE',
    subtotal decimal(10,2) not null,
    valor_frete decimal(10,2) not null,
    valor_total decimal(10,2) not null,
    endereco_entrega_cep varchar(9) not null,
    endereco_entrega_logradouro varchar(255) not null,
    endereco_entrega_numero varchar(20) not null,
    endereco_entrega_complemento varchar(100),
    endereco_entrega_bairro varchar(100) not null,
    endereco_entrega_cidade varchar(100) not null,
    endereco_entrega_uf varchar(2) not null,
    observacoes text,
    data_atualizacao timestamp default current_timestamp on update current_timestamp,
    foreign key (id_cliente) references tb_cliente(id_cliente),
    index idx_cliente_data (id_cliente, data_pedido),
    index idx_status (status),
    index idx_numero_pedido (numero_pedido)
);

-- Tabela para itens dos pedidos
create table if not exists tb_item_pedido (
    id_item_pedido bigint primary key auto_increment,
    id_pedido bigint not null,
    id_produto int not null,
    quantidade int not null check (quantidade > 0),
    preco_unitario decimal(10,2) not null,
    subtotal decimal(10,2) not null,
    nome_produto varchar(200) not null,
    descricao_produto text,
    foreign key (id_pedido) references tb_pedido(id_pedido) on delete cascade,
    foreign key (id_produto) references tb_produto(id_produto),
    index idx_pedido (id_pedido),
    index idx_produto (id_produto)
);
