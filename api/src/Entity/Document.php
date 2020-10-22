<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\HttpFoundation\Tests\StringableObject;
use App\Entity\Base\BaseEntity;

/**
 * @ORM\Entity()
 * @ORM\Table(name="documents")
 */
class Document extends BaseEntity
{
    public function __construct()
    {
        parent::__construct();
        $this->document_tags = new ArrayCollection();
        $this->document_exercises = new ArrayCollection();
    }

    /**
     * @ORM\Id
     * @ORM\Column(type="string")
     * @ORM\GeneratedValue(strategy="UUID")
     */
    protected $document_id;

    /**
     * @ORM\Column(type="string")
     */
    protected $document_name;

    /**
     * @ORM\Column(type="string", nullable=true)
     */
    protected $document_description;

    /**
     * @ORM\Column(type="string")
     */
    protected $document_type;

    /**
     * @ORM\Column(type="string")
     */
    protected $document_path;

    /**
     * @ORM\ManyToMany(targetEntity="Tag", inversedBy="tag_documents")
     * @ORM\JoinTable(name="documents_tags",
     *      joinColumns={@ORM\JoinColumn(name="document_id", referencedColumnName="document_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="tag_id", referencedColumnName="tag_id", onDelete="CASCADE")}
     *      )
     * @var User[]
     */
    protected $document_tags;

    protected $document_liste_tags = [];

    protected $document_liste_tags_exercise = [];

    public function computeDocumentListeTags()
    {
        foreach ($this->getDocumentTags() as $tag) {
            $this->document_liste_tags[] = array('tag_id' => $tag->getTagId(), 'tag_name' => $tag->getTagName());
        }
    }

    public function computeDocumentListeTagsExercise()
    {
        foreach ($this->getDocumentTagsExercise() as $exercise) {
            $this->document_liste_tags_exercise[] = array('exercise_id' => $exercise->getExerciseId(), 'exercise_name' => $exercise->getExerciseName());
        }
    }

    public function getDocumentListeTags()
    {
        return $this->document_liste_tags;
    }

    public function getDocumentListeTagsExercise()
    {
        return $this->document_liste_tags_exercise;
    }

    /**
     * @ORM\ManyToMany(targetEntity="Exercise", inversedBy="exercise_documents")
     * @ORM\JoinTable(name="documents_exercises",
     *      joinColumns={@ORM\JoinColumn(name="document_id", referencedColumnName="document_id", onDelete="CASCADE")},
     *      inverseJoinColumns={@ORM\JoinColumn(name="exercise_id", referencedColumnName="exercise_id", onDelete="CASCADE")}
     *      )
     * @var Exercise[]
     */
    protected $document_exercises;

    public function getDocumentTagsExercise()
    {
        return $this->document_exercises;
    }

    public function getDocumentTags()
    {
        return $this->document_tags;
    }

    public function removeTagExercise($exercise)
    {
        if ($this->document_exercises->contains($exercise)) {
            $this->document_exercises->removeElement($exercise);
        }
        return $this;
    }

    public function removeTag($tag)
    {
        if ($this->document_tags->contains($tag)) {
            $this->document_tags->removeElement($tag);
        }
        return $this;
    }

    public function addTagExercise($exercise)
    {
        if (!$this->document_exercises->contains($exercise)) {
            $this->document_exercises->add($exercise);
        }
        return $this;
    }

    public function addTag($tag)
    {
        if (!$this->document_tags->contains($tag)) {
            $this->document_tags->add($tag);
        }
        return $this;
    }

    public function getDocumentId()
    {
        return $this->document_id;
    }

    public function setDocumentName($name)
    {
        $this->document_name = $name;
        return $this;
    }

    public function getDocumentName()
    {
        return $this->document_name;
    }

    public function setDocumentDescription($description)
    {
        $this->document_description = $description;
        return $this;
    }

    public function getDocumentDescription()
    {
        return $this->document_description;
    }

    public function setDocumentType($type)
    {
        $this->document_type = $type;
        return $this;
    }

    public function getDocumentType()
    {
        return $this->document_type;
    }

    public function setDocumentPath($path)
    {
        $this->document_path = $path;
        return $this;
    }

    public function getDocumentPath()
    {
        return $this->document_path;
    }
}
