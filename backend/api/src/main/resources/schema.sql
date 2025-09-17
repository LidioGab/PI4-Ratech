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
