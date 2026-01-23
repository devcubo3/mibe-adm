'use client';

import React from 'react';
import { useAuth } from '@/hooks';
import { useForm } from '@/hooks';
import { Button, Input } from '@/components/common';
import { validators } from '@/utils';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function RegisterPage() {
  const { register } = useAuth();

  const { values, errors, loading, handleChange, handleSubmit } = useForm({
    initialValues: {
      name: '',
      email: '',
      cpf: '',
      birthDate: '',
      password: '',
    },
    validate: (values) => {
      const errors: any = {};
      const nameError = validators.required(values.name);
      const emailError = validators.email(values.email);
      const cpfError = validators.cpf(values.cpf);
      const dateError = validators.date(values.birthDate);
      const passwordError = validators.password(values.password);

      if (nameError) errors.name = nameError;
      if (emailError) errors.email = emailError;
      if (cpfError) errors.cpf = cpfError;
      if (dateError) errors.birthDate = dateError;
      if (passwordError) errors.password = passwordError;

      return errors;
    },
    onSubmit: async (values) => {
      await register(values);
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h1 className={styles.formTitle}>Criar Conta</h1>
          <p className={styles.formSubtitle}>Preencha os dados para criar sua conta</p>
        </div>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Input
            label="Nome Completo"
            placeholder="Seu nome"
            value={values.name}
            onChange={handleChange('name')}
            error={errors.name}
          />

          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={values.email}
            onChange={handleChange('email')}
            error={errors.email}
          />

          <Input
            label="CPF"
            placeholder="000.000.000-00"
            value={values.cpf}
            onChange={handleChange('cpf')}
            error={errors.cpf}
          />

          <Input
            label="Data de Nascimento"
            placeholder="DD/MM/AAAA"
            value={values.birthDate}
            onChange={handleChange('birthDate')}
            error={errors.birthDate}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
          />

          <Button title="Cadastrar" type="submit" loading={loading} />
        </form>

        <div className={styles.footer}>
          <p>
            Já tem uma conta? <Link href="/login" className={styles.link}>Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
