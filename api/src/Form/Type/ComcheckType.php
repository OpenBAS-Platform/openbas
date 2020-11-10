<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class ComcheckType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('comcheck_audience');
        $builder->add('comcheck_end_date', DateTimeType::class, array(
            'widget' => 'single_text',
            'input' => 'datetime'
        ));
        $builder->add('comcheck_subject');
        $builder->add('comcheck_message');
        $builder->add('comcheck_footer');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'App\Entity\Comcheck',
            'csrf_protection' => false,
            'allow_extra_fields' => true
        ]);
    }
}
