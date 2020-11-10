<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('user_firstname');
        $builder->add('user_lastname');
        $builder->add('user_email', EmailType::class);
        $builder->add('user_email2', EmailType::class);
        $builder->add('user_phone');
        $builder->add('user_phone2');
        $builder->add('user_phone3');
        $builder->add('user_pgp_key');
        $builder->add('user_plain_password');
        $builder->add('user_organization', TextType::class);
        $builder->add('user_lang');
        $builder->add('user_admin');
        $builder->add('user_planificateur');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'App\Entity\User',
            'csrf_protection' => false,
            'allow_extra_fields' => true
        ]);
    }
}
