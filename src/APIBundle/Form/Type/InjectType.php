<?php

namespace APIBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;

class InjectType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('inject_title');
        $builder->add('inject_description');
        $builder->add('inject_content');
        $builder->add('inject_date', DateTimeType::class, array(
            'widget' => 'single_text',
            'input' => 'datetime'
        ));
        $builder->add('inject_sender');
        $builder->add('inject_audiences');
        $builder->add('inject_type');
        $builder->add('inject_automatic');
        $builder->add('inject_status');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'APIBundle\Entity\Inject',
            'csrf_protection' => false
        ]);
    }
}
