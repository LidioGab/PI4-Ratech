package com.pi4.backend.api.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    private Integer idUser;

    @Column(name = "nm_user", nullable = false, length = 100)
    private String nmUser;

    @Column(name = "ds_email", nullable = false, length = 250)
    private String dsEmail;

    @Column(name = "ds_cpf", nullable = false, length = 20)
    private String dsCpf;

    @Column(name = "ds_telefone", nullable = false, length = 20)
    private String dsTelefone;

    @Column (name = "ds_senha", nullable = false, length = 20 )
    private String dsSenha;

    public Integer getIdUser() { return idUser; }
    public void setIdUser(Integer idUser) { this.idUser = idUser; }
    public String getNmUser() { return nmUser; }
    public void setNmUser(String nmUser) { this.nmUser = nmUser; }
    public String getDsEmail() { return dsEmail; }
    public void setDsEmail(String dsEmail) { this.dsEmail = dsEmail; }
    public String getDsCpf() { return dsCpf; }
    public void setDsCpf(String dsCpf) { this.dsCpf = dsCpf; }
    public String getDsTelefone() { return dsTelefone; }
    public void setDsTelefone(String dsTelefone) { this.dsTelefone = dsTelefone; }
    public void setDsSenha(String dsSenha) {this.dsSenha = dsSenha;}
    public String getDsSenha() {return dsSenha;}

}
