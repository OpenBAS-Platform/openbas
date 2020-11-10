<?php

namespace App\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class IncidentType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('incident_title');
        $builder->add('incident_story');
        $builder->add('incident_type');
        $builder->add('incident_weight');
        $builder->add('incident_subobjectives');
        $builder->add('incident_order');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'App\Entity\Incident',
            'csrf_protection' => false
        ]);
    }
}
