'use client';

import React from 'react';
import { useAuth } from '@/hooks';
import { useForm } from '@/hooks';
import { Button, Input } from '@/components/common';
import { Logo } from '@/components/common/Logo';
import { validators } from '@/utils';
import styles from './login.module.css';

export default function LoginPage() {
  const { login } = useAuth();

  const { values, errors, loading, handleChange, handleSubmit } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: any = {};
      const emailError = validators.email(values.email);
      const passwordError = validators.required(values.password);

      if (emailError) errors.email = emailError;
      if (passwordError) errors.password = passwordError;

      return errors;
    },
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <Logo width={180} color="#181818" className={styles.logo} />
          <h1 className={styles.formTitle}>Bem-vindo ao Admin</h1>
          <p className={styles.formSubtitle}>Faça login para acessar o painel administrativo</p>
        </div>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={values.email}
            onChange={handleChange('email')}
            error={errors.email}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
          />

          <Button title="Entrar" type="submit" loading={loading} />
        </form>

      </div>
    </div>
  );
}
