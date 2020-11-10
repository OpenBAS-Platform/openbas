<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class DefaultController extends AbstractController
{
    public function indexAction()
    {
        return $this->render('views/Default/index.html.twig');
    }
}
