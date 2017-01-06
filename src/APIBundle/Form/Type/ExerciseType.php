<?php

namespace APIBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Form\Extension\Core\Type\DateTimeType;
use Symfony\Component\Form\Extension\Core\Type\FileType;

class ExerciseType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('exercise_name');
        $builder->add('exercise_subtitle');
        $builder->add('exercise_description');
        $builder->add('exercise_start_date', DateTimeType::class, array(
            'widget' => 'single_text',
            'input' => 'datetime'
        ));
        $builder->add('exercise_end_date', DateTimeType::class, array(
            'widget' => 'single_text',
            'input' => 'datetime'
        ));
        $builder->add('exercise_image');
        $builder->add('exercise_canceled');
        $builder->add('exercise_message_header');
        $builder->add('exercise_message_footer');
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'APIBundle\Entity\Exercise',
            'csrf_protection' => false
        ]);
    }
}