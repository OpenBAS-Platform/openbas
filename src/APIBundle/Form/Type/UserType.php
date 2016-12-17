<?php

namespace APIBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class UserType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('user_firstname');
        $builder->add('user_lastname');
        $builder->add('user_email', EmailType::class);
        $builder->add('user_phone');
        $builder->add('user_plain_password');
        $builder->add('user_organization', TextType::class);
        $builder->add('user_lang');
        $builder->add('user_admin');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'APIBundle\Entity\User',
            'csrf_protection' => false
        ]);
    }
}